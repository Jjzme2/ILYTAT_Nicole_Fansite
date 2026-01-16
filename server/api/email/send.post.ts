import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'

interface EmailPayload {
    to: string
    subject: string
    text?: string
    html?: string
    templateId?: string // SendGrid template ID
    dynamicTemplateData?: Record<string, any> // SendGrid template variables
}

// SendGrid sender
async function sendWithSendGrid(config: any, payload: EmailPayload): Promise<boolean> {
    if (!config.sendgridApiKey) {
        console.log('[Email] SendGrid not configured, skipping...')
        return false
    }

    sgMail.setApiKey(config.sendgridApiKey)

    const msg: any = {
        to: payload.to,
        from: config.sendgridFromEmail || 'noreply@ilytat.com',
        subject: payload.subject
    }

    // Use template if provided, otherwise use text/html
    if (payload.templateId) {
        msg.templateId = payload.templateId
        msg.dynamicTemplateData = payload.dynamicTemplateData || {}
    } else {
        msg.text = payload.text || ''
        msg.html = payload.html || ''
    }

    try {
        await sgMail.send(msg)
        console.log('[Email] Sent via SendGrid')
        return true
    } catch (error: any) {
        const errorBody = error?.response?.body
        console.error('[Email] SendGrid failed:', errorBody || error.message)

        // Check if it's a rate limit or capacity error (should fallback)
        const statusCode = error?.code || error?.response?.statusCode
        if (statusCode === 429 || statusCode === 503) {
            console.log('[Email] SendGrid capacity reached, will try fallback...')
            return false
        }

        // For other errors (invalid API key, bad request), throw
        throw error
    }
}

// Nodemailer fallback sender
async function sendWithNodemailer(config: any, payload: EmailPayload): Promise<boolean> {
    console.log('[Email] Checking Nodemailer config...')
    console.log('[Email] SMTP Host:', config.smtpHost || '(not set)')
    console.log('[Email] SMTP Port:', config.smtpPort || '(not set)')
    console.log('[Email] SMTP User:', config.smtpUser || '(not set)')
    console.log('[Email] SMTP Pass:', config.smtpPass ? '****' + config.smtpPass.slice(-4) : '(not set)')
    console.log('[Email] SMTP From:', config.smtpFrom || '(not set)')
    console.log('[Email] SMTP Secure:', config.smtpSecure)

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

    console.log('[Email] Creating transport with config:', {
        ...transportConfig,
        auth: { user: transportConfig.auth.user, pass: '****' }
    })

    const transporter = nodemailer.createTransport(transportConfig)

    const mailOptions = {
        from: config.smtpFrom || `"ILYTAT Notifications" <${config.smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || ''
    }

    console.log('[Email] Sending with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    })

    try {
        const result = await transporter.sendMail(mailOptions)
        console.log('[Email] Sent via Nodemailer (fallback), messageId:', result.messageId)
        return true
    } catch (error: any) {
        console.error('[Email] Nodemailer failed:', error.message)
        console.error('[Email] Full error:', error)
        throw error
    }
}

export default defineEventHandler(async (event) => {
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

    // Waterfall: Try SendGrid first, then Nodemailer
    let sent = false
    let provider: 'sendgrid' | 'nodemailer' | null = null

    // 1. Try SendGrid
    try {
        sent = await sendWithSendGrid(config, { to, subject, text, html, templateId, dynamicTemplateData })
        if (sent) provider = 'sendgrid'
    } catch (e) {
        // SendGrid failed with a non-capacity error, still try fallback
        console.warn('[Email] SendGrid error, trying fallback...')
    }

    // 2. Fallback to Nodemailer
    if (!sent) {
        try {
            sent = await sendWithNodemailer(config, { to, subject, text, html })
            if (sent) provider = 'nodemailer'
        } catch (e: any) {
            throw createError({
                statusCode: 500,
                message: 'All email providers failed: ' + e.message
            })
        }
    }

    if (!sent) {
        throw createError({
            statusCode: 500,
            message: 'No email provider configured. Set NUXT_SENDGRID_API_KEY or SMTP settings.'
        })
    }

    return {
        success: true,
        message: 'Email sent successfully',
        provider
    }
})
