import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Security: Authenticate User
    const user = await getUserFromEvent(event)

    // 2. Security: Authorization (Admin or Creator)
    if (user.role !== 'admin' && user.role !== 'creator') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Insufficient permissions'
        })
    }

    const body = await readBody(event)
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

    // 3. Use Utility
    // sendEmail is auto-imported from server/utils/email.ts
    return await sendEmail({ to, subject, text, html, templateId, dynamicTemplateData })
})
