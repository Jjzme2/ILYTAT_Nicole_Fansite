import { Cron } from 'croner'
import { sendDailyReport } from '../utils/reports'

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig()

    // Parse report emails (comma-separated list)
    const reportEmailList = config.reportEmail
        ? config.reportEmail.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []

    if (reportEmailList.length === 0) {
        console.log('[Scheduler] No report emails configured. Daily reports disabled.')
        return
    }

    console.log(`[Scheduler] Daily reports configured for: ${reportEmailList.join(', ')}`)

    // Schedule daily report at 8:00 AM CST
    // Croner uses standard cron format: second minute hour dayOfMonth month dayOfWeek
    // CST is handled via timezone option
    const job = new Cron('0 8 * * *', {
        timezone: 'America/Chicago'
    }, async () => {
        console.log('[Scheduler] Running daily report job...')
        console.log('[Scheduler] Current time:', new Date().toISOString())

        try {
            // Use utility directly to bypass API auth requirement for internal cron
            const response = await sendDailyReport()
            console.log('[Scheduler] Daily report completed:', response)
        } catch (error: any) {
            console.error('[Scheduler] Daily report failed:', error.message)
        }
    })

    console.log('[Scheduler] Daily report scheduled for 8:00 AM CST every day')
    console.log('[Scheduler] Next run:', job.nextRun()?.toISOString())

    // Log startup confirmation
    setTimeout(() => {
        console.log('[Scheduler] Server started. Daily reports are active.')
        console.log(`[Scheduler] Next report will be sent at 8:00 AM CST to: ${reportEmailList.join(', ')}`)
    }, 5000)
})
