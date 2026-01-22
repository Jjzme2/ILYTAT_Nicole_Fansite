import { sendDailyReport } from '../../utils/reports'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    // 1. Authenticate and Authorize
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin' && user.role !== 'developer') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Admin access required.'
        })
    }

    // Check for test override
    let forceRecipient = null
    try {
        const body = await readBody(event)
        if (body?.forceRecipient) forceRecipient = body.forceRecipient
    } catch (e) { /* ignore body parse error */ }

    // 2. Use the utility
    return await sendDailyReport(forceRecipient)
})
