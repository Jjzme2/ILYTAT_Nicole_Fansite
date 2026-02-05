import nodemailer from 'nodemailer'

interface EmailPayload {
    to: string
    subject: string
    text?: string
    html?: string
    templateId?: string // Optional override (ID)
    templateName?: string // Optional override (Alias: 'daily', 'general')
    dynamicTemplateData?: Record<string, any> // Additional params
}

// EmailJS REST API Sender
async function sendWithEmailJS(config: any, payload: EmailPayload): Promise<boolean> {
    const serviceId = config.emailjs?.serviceId

    // Resolve Template ID
    let templateId = payload.templateId
    if (!templateId && payload.templateName === 'daily') templateId = config.emailjs?.dailyReportTemplateId
    if (!templateId) templateId = config.emailjs?.generalTemplateId

    const publicKey = config.emailjs?.publicKey
    const privateKey = config.emailjs?.privateKey



    if (!serviceId || !templateId || !publicKey || !privateKey) {
        console.log('[Email] EmailJS not fully configured, skipping...')
        return false
    }

    // Map standard fields to common EmailJS template constraints
    // Assuming template has variables: {{to_email}}, {{subject}}, {{message}}, {{html_message}}
    const templateParams = {
        title: payload.subject,
        name: payload.to,
        message: payload.text || '',
        time: new Date().toLocaleString(),
        ...payload.dynamicTemplateData
    }

    try {
        await $fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: templateParams
            }
        })
        console.log('[Email] Sent via EmailJS')
        return true
    } catch (error: any) {
        console.error('[Email] EmailJS failed:', error.data || error.message)
        // Fallback on any error
        return false
    }
}

// Nodemailer fallback sender
async function sendWithNodemailer(config: any, payload: EmailPayload): Promise<boolean> {
    console.log('[Email] Checking Nodemailer config...')

    if (!config.smtpHost || !config.smtpUser) {
        console.log('[Email] Nodemailer SMTP not configured, skipping...')
        return false
    }

    const transportConfig = {
        host: config.smtpHost,
        port: parseInt(config.smtpPort || '587'),
        secure: config.smtpSecure === 'true',
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        }
    }

    const transporter = nodemailer.createTransport(transportConfig)

    const mailOptions = {
        from: config.smtpFrom || `"ILYTAT Notifications" <${config.smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || ''
    }

    try {
        const result = await transporter.sendMail(mailOptions)
        console.log('[Email] Sent via Nodemailer (fallback), messageId:', result.messageId)
        return true
    } catch (error: any) {
        console.error('[Email] Nodemailer failed:', error.message)
        return false
    }
}

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const body = await readBody(event) as EmailPayload
    const { to, subject, text, html, templateId, dynamicTemplateData } = body

    if (!to || !subject) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: to, subject'
        })
    }

    if (!text && !html && !templateId) {
        throw createError({
            statusCode: 400,
            message: 'Must provide text, html, or templateId'
        })
    }

    const config = useRuntimeConfig()

    // Waterfall: Try EmailJS first, then Nodemailer
    let sent = false
    let provider: 'emailjs' | 'nodemailer' | null = null

    // 1. Try EmailJS
    sent = await sendWithEmailJS(config, { to, subject, text, html, templateId, dynamicTemplateData })
    if (sent) provider = 'emailjs'

    // 2. Fallback to Nodemailer
    if (!sent) {
        console.warn('[Email] Primary provider failed or not configured, trying Nodemailer...')
        sent = await sendWithNodemailer(config, { to, subject, text, html })
        if (sent) provider = 'nodemailer'
    }

    if (!sent) {
        throw createError({
            statusCode: 500,
            message: 'All email providers failed or are not configured.'
        })
    }

    return {
        success: true,
        message: 'Email sent successfully',
        provider
    }
})
