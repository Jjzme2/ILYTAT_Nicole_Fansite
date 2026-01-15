import { useFirebaseAdmin } from '~/server/utils/firebaseAdmin'

interface DailyStats {
    date: string
    users: {
        total: number
        newToday: number
        subscribers: number
        creators: number
        admins: number
    }
    posts: {
        total: number
        newToday: number
        byType: Record<string, number>
    }
    brandDeals: {
        total: number
        pending: number
        active: number
    }
    suggestions: {
        total: number
        newToday: number
    }
    developerTasks: {
        open: number
        inProgress: number
        done: number
    }
    quotaResets: {
        individualToday: number
        globalToday: number
    }
}

async function gatherDailyStats(): Promise<DailyStats> {
    const { db } = useFirebaseAdmin()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Users stats
    const usersSnap = await db.collection('users').get()
    const users = usersSnap.docs.map(doc => doc.data())
    const newUsersToday = users.filter(u => {
        const createdAt = u.createdAt?.toDate?.() || new Date(u.createdAt)
        return createdAt >= todayStart
    })

    // Posts stats
    const postsSnap = await db.collection('posts').get()
    const posts = postsSnap.docs.map(doc => doc.data())
    const newPostsToday = posts.filter(p => {
        const createdAt = p.createdAt?.toDate?.() || new Date(p.createdAt)
        return createdAt >= todayStart
    })
    const postsByType = posts.reduce((acc, p) => {
        acc[p.type || 'unknown'] = (acc[p.type || 'unknown'] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    // Brand Deals stats
    const dealsSnap = await db.collection('brand_deals').get()
    const deals = dealsSnap.docs.map(doc => doc.data())

    // Suggestions stats
    const suggestionsSnap = await db.collection('suggestions').get()
    const suggestions = suggestionsSnap.docs.map(doc => doc.data())
    const newSuggestionsToday = suggestions.filter(s => {
        const createdAt = s.createdAt?.toDate?.() || new Date(s.createdAt)
        return createdAt >= todayStart
    })

    // Developer Tasks stats
    const tasksSnap = await db.collection('developer_tasks').get()
    const tasks = tasksSnap.docs.map(doc => doc.data())

    // Quota Resets stats
    const resetsSnap = await db.collection('quota_resets')
        .where('timestamp', '>=', todayStart)
        .get()

    return {
        date: now.toISOString().split('T')[0],
        users: {
            total: users.length,
            newToday: newUsersToday.length,
            subscribers: users.filter(u => u.isSubscriber).length,
            creators: users.filter(u => u.role === 'creator').length,
            admins: users.filter(u => u.role === 'admin').length
        },
        posts: {
            total: posts.length,
            newToday: newPostsToday.length,
            byType: postsByType
        },
        brandDeals: {
            total: deals.length,
            pending: deals.filter(d => d.status === 'pending').length,
            active: deals.filter(d => d.status === 'active').length
        },
        suggestions: {
            total: suggestions.length,
            newToday: newSuggestionsToday.length
        },
        developerTasks: {
            open: tasks.filter(t => t.status === 'open').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            done: tasks.filter(t => t.status === 'done').length
        },
        quotaResets: {
            individualToday: resetsSnap.docs.filter(d => !d.data().isGlobal).length,
            globalToday: resetsSnap.docs.filter(d => d.data().isGlobal).length
        }
    }
}

function formatReportEmail(stats: DailyStats): { subject: string; html: string; text: string } {
    const subject = `📊 ILYTAT Daily Report - ${stats.date}`

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 12px; padding: 30px; }
        h1 { color: #e94560; margin-bottom: 5px; }
        h2 { color: #0f3460; background: #e94560; padding: 10px 15px; border-radius: 6px; margin-top: 25px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
        .stat-card { background: #0f3460; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #e94560; }
        .stat-label { font-size: 12px; color: #aaa; text-transform: uppercase; margin-top: 5px; }
        .highlight { color: #4ecca3; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Daily Platform Report</h1>
        <p style="color: #888; margin-top: 0;">${stats.date}</p>

        <h2>👥 Users</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.users.total}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-value highlight">+${stats.users.newToday}</div>
                <div class="stat-label">New Today</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.users.subscribers}</div>
                <div class="stat-label">Subscribers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.users.creators + stats.users.admins}</div>
                <div class="stat-label">Team Members</div>
            </div>
        </div>

        <h2>📝 Content</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.posts.total}</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value highlight">+${stats.posts.newToday}</div>
                <div class="stat-label">Posted Today</div>
            </div>
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 10px;">
            By type: ${Object.entries(stats.posts.byType).map(([type, count]) => `${type}: ${count}`).join(', ') || 'None yet'}
        </p>

        <h2>🤝 Brand Deals</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.brandDeals.total}</div>
                <div class="stat-label">Total Deals</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #ffc107;">${stats.brandDeals.pending}</div>
                <div class="stat-label">Pending Review</div>
            </div>
        </div>

        <h2>💡 Fan Suggestions</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.suggestions.total}</div>
                <div class="stat-label">Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-value highlight">+${stats.suggestions.newToday}</div>
                <div class="stat-label">New Today</div>
            </div>
        </div>

        <h2>🛠️ Dev Tasks</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value" style="color: #ff6b6b;">${stats.developerTasks.open}</div>
                <div class="stat-label">Open</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #ffc107;">${stats.developerTasks.inProgress}</div>
                <div class="stat-label">In Progress</div>
            </div>
        </div>

        <h2>🔄 Admin Actions</h2>
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value highlight">${stats.quotaResets.individualToday}</div>
                <div class="stat-label">Member Quota Resets</div>
            </div>
            <div class="stat-card">
                <div class="stat-value highlight">${stats.quotaResets.globalToday}</div>
                <div class="stat-label">Global Resets</div>
            </div>
        </div>

        <div class="footer">
            <p>This report is sent daily at 8:00 AM CST.</p>
            <p>ILYTAT Platform &copy; ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
`

    const text = `
📊 ILYTAT Daily Report - ${stats.date}

👥 USERS
- Total: ${stats.users.total}
- New Today: +${stats.users.newToday}
- Subscribers: ${stats.users.subscribers}
- Team Members: ${stats.users.creators + stats.users.admins}

📝 CONTENT
- Total Posts: ${stats.posts.total}
- Posted Today: +${stats.posts.newToday}
- By Type: ${Object.entries(stats.posts.byType).map(([type, count]) => `${type}: ${count}`).join(', ') || 'None yet'}

🤝 BRAND DEALS
- Total: ${stats.brandDeals.total}
- Pending: ${stats.brandDeals.pending}
- Active: ${stats.brandDeals.active}

💡 FAN SUGGESTIONS
- Total: ${stats.suggestions.total}
- New Today: +${stats.suggestions.newToday}

🛠️ DEV TASKS
- Open: ${stats.developerTasks.open}
- In Progress: ${stats.developerTasks.inProgress}
- Done: ${stats.developerTasks.done}

🔄 ADMIN ACTIONS
- Individual Quota Resets: ${stats.quotaResets.individualToday}
- Global Resets: ${stats.quotaResets.globalToday}

---
This report is sent daily at 8:00 AM CST.
ILYTAT Platform © ${new Date().getFullYear()}
`

    return { subject, html, text }
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Parse report emails (comma-separated list)
    const reportEmailList = config.reportEmail
        ? config.reportEmail.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []

    if (reportEmailList.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'No report emails configured. Set NUXT_REPORT_EMAIL in .env'
        })
    }

    console.log('[Daily Report] Gathering stats...')
    const stats = await gatherDailyStats()
    console.log('[Daily Report] Stats gathered:', JSON.stringify(stats, null, 2))

    const { subject, html, text } = formatReportEmail(stats)

    // Send to each recipient
    const results: { email: string; success: boolean; error?: string }[] = []

    for (const email of reportEmailList) {
        try {
            console.log(`[Daily Report] Sending to ${email}...`)
            await $fetch('/api/email/send', {
                method: 'POST',
                body: {
                    to: email,
                    subject,
                    html,
                    text
                }
            })
            results.push({ email, success: true })
            console.log(`[Daily Report] ✅ Sent to ${email}`)
        } catch (error: any) {
            console.error(`[Daily Report] ❌ Failed to send to ${email}:`, error.message)
            results.push({ email, success: false, error: error.message })
        }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return {
        success: failCount === 0,
        message: `Daily report sent to ${successCount}/${reportEmailList.length} recipients`,
        stats,
        results
    }
})
