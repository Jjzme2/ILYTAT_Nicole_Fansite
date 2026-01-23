import { sendEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
    // 1. Authenticate (Admin only)
    const user = await getUserFromEvent(event)
    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Admin access only'
        })
    }

    const query = getQuery(event)
    const to = query.to as string

    if (!to) {
        throw createError({
            statusCode: 400,
            message: 'Missing "to" query parameter. Usage: /api/email/test?to=your@email.com'
        })
    }

    const config = useRuntimeConfig()

    // Show which providers are configured
    const providers = {
        emailjs: !!(config.emailjs?.serviceId && config.emailjs?.publicKey),
        smtp: !!(config.smtpHost && config.smtpUser)
    }

    try {
        const result = await sendEmail(config, {
            to,
            subject: '🎉 ILYTAT Email Test - Success!',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="color: #8B5CF6; margin-bottom: 20px;">Email System Working! 🚀</h1>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        This is a test email from your ILYTAT Fans application.
                    </p>
                    <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #1F2937; margin: 0 0 10px 0;">Configuration Status:</h3>
                        <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
                            <li>EmailJS: ${providers.emailjs ? '✅ Configured' : '❌ Not configured'}</li>
                            <li>SMTP (Zoho): ${providers.smtp ? '✅ Configured' : '❌ Not configured'}</li>
                        </ul>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">
                        Sent at: ${new Date().toLocaleString()}
                    </p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
                        ILYTAT LLC • Nicole Circle
                    </p>
                </div>
            `,
            text: `Email System Working!\n\nThis is a test email from your ILYTAT Fans application.\n\nEmailJS: ${providers.emailjs ? 'Configured' : 'Not configured'}\nSMTP: ${providers.smtp ? 'Configured' : 'Not configured'}\n\nSent at: ${new Date().toLocaleString()}`
        })

        return {
            success: result.success,
            message: result.success ? `Test email sent to ${to}` : result.message,
            provider: result.provider,
            providers,
            error: result.success ? undefined : result.message
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to send test email',
            providers,
            error: error.data || error.message
        }
    }
})
