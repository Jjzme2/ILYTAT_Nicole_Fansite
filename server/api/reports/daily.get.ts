// GET endpoint to manually trigger the daily report (for testing)
export default defineEventHandler(async (event) => {
    console.log('[Daily Report] Manual trigger via GET request')

    try {
        const result = await $fetch('/api/reports/daily', {
            method: 'POST'
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
