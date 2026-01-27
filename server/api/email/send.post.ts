import { sendEmail, type EmailPayload } from '../../utils/email'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Security Check
    await requireAdmin(event)

    // 2. Process Request
    const body = await readBody(event) as EmailPayload

    // Delegate to utility
    return await sendEmail(body)
})
