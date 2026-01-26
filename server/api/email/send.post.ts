import { sendEmail, type EmailPayload } from '../../utils/email'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Security Check: Only Admins or System
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: 'Unauthorized: Admin permissions required'
        })
    }

    // 2. Read Body
    const body = await readBody(event) as EmailPayload

    // 3. Send Email
    return await sendEmail(body)
})
