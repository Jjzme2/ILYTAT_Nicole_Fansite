// GET endpoint to manually trigger the daily report (for testing)
export default defineEventHandler(async (event) => {
    // 1. Verify Admin Access
    await requireAdmin(event)

    console.log('[Daily Report] Manual trigger via GET request')

    // Forward the authorization header to the internal POST request
    const authHeader = getRequestHeader(event, 'Authorization')

    try {
        const result = await $fetch('/api/reports/daily', {
            method: 'POST',
            headers: {
                Authorization: authHeader || ''
            }
        })

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
