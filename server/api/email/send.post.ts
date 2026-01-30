import { type EmailPayload } from '../../utils/email'

export default defineEventHandler(async (event) => {
    // 1. Verify Admin/System Access
    await requireAdmin(event)

    // 2. Parse Body
    const body = await readBody(event) as EmailPayload

    // 3. Send Email
    // Logic delegated to shared utility
    return await sendEmail(body)
})
