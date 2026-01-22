import { sendDailyReport } from '../../utils/reports'
import { getUserFromEvent } from '../../utils/auth'

// GET endpoint to manually trigger the daily report (for testing)
export default defineEventHandler(async (event) => {
    // 1. Authenticate and Authorize
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin' && user.role !== 'developer') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Admin access required.'
        })
    }

    console.log('[Daily Report] Manual trigger via GET request')

    try {
        // 2. Use the utility directly
        const result = await sendDailyReport()

        return {
            triggered: true,
            message: 'Daily report triggered successfully',
            result
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: 'Failed to trigger daily report: ' + error.message
        })
    }
})
