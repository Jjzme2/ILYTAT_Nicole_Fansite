import { sendEmail, type EmailPayload } from '../../utils/email'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Authenticate and Authorize
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin' && user.role !== 'developer') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Admin access required to send arbitrary emails.'
        })
    }

    const body = await readBody(event) as EmailPayload

    // 2. Use the utility
    return await sendEmail(body)
})
