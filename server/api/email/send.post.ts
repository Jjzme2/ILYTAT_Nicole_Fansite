import { getUserFromEvent } from '../../utils/auth'
import { sendEmail, type EmailPayload } from '../../utils/email'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin' && user.role !== 'developer') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Insufficient permissions'
        })
    }

    // 2. Parse Body
    const body = await readBody(event) as EmailPayload

    // 3. Send Email (validation happens inside util)
    return await sendEmail(body)
})
