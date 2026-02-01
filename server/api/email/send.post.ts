import { sendEmail, type EmailPayload } from '../../utils/email'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin' && user.role !== 'creator') {
        throw createError({
            statusCode: 403,
            message: 'Unauthorized: Insufficient permissions'
        })
    }

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

    // Delegate to utility
    const result = await sendEmail({
        to,
        subject,
        text,
        html,
        templateId,
        dynamicTemplateData
    })

    return {
        success: true,
        message: 'Email sent successfully',
        provider: result.provider
    }
})
