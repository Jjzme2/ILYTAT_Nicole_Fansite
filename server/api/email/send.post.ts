import { sendEmail, type EmailPayload } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
    // 1. Authenticate and Authorize
    const user = await getUserFromEvent(event)

    // Only allow admins and creators to send emails
    if (user.role !== 'admin' && user.role !== 'creator') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: functionality restricted to admins and creators.'
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

    const config = useRuntimeConfig()

    const result = await sendEmail(config, { to, subject, text, html, templateId, dynamicTemplateData })

    if (!result.success) {
        throw createError({
            statusCode: 500,
            message: result.message
        })
    }

    return result
})
