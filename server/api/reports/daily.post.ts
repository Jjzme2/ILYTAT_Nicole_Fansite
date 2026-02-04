


interface DailyStats {
    date: string
    users: {
        total: number
        newToday: number
        newUsersDetails: { displayName: string, email: string }[]
        subscribers: number
        subscribersDetails: { displayName: string, email: string }[]
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
        total: number
        newToday: number
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

    const newUsers = users.filter(u => {
        const createdAt = u.createdAt?.toDate?.() || new Date(u.createdAt)
        return createdAt >= todayStart
    })

    const subscribers = users.filter(u => u.isSubscriber)

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
    const tasksSnap = await db.collection('tasks').get()
    const tasks = tasksSnap.docs.map(doc => doc.data())
    const newTasksToday = tasks.filter(t => {
        const createdAt = t.createdAt?.toDate?.() || new Date(t.createdAt)
        return createdAt >= todayStart
    })

    // Quota Resets stats
    const resetsSnap = await db.collection('quota_resets')
        .where('timestamp', '>=', todayStart)
        .get()

    return {
        date: now.toLocaleDateString(),
        users: {
            total: users.length,
            newToday: newUsers.length,
            newUsersDetails: newUsers.map(u => ({ displayName: u.displayName || 'Unknown', email: u.email })),
            subscribers: subscribers.length,
            subscribersDetails: subscribers.map(u => ({ displayName: u.displayName || 'Unknown', email: u.email })),
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
            total: tasks.length,
            newToday: newTasksToday.length,
            open: tasks.filter(t => t.status === 'todo' || t.status === 'open').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            done: tasks.filter(t => t.status === 'done').length
        },
        quotaResets: {
            individualToday: resetsSnap.docs.filter(d => !d.data().isGlobal).length,
            globalToday: resetsSnap.docs.filter(d => d.data().isGlobal).length
        }
    }
}

function formatListToHtml(title: string, items: { displayName: string, email: string }[], color: string) {
    if (items.length === 0) return ''
    return `
        <div class="list-group">
            <div style="font-weight:bold; margin-bottom:5px; color:${color};">${title}</div>
            ${items.map(u => `<div class="list-item"><b>${u.displayName}</b> (${u.email})</div>`).join('')}
        </div>
    `
}

export default defineEventHandler(async (event) => {
    // 🛡️ Security: Require Admin
    await requireAdmin(event)

    const authHeader = getRequestHeader(event, 'Authorization')
    const config = useRuntimeConfig()

    // Check for test override
    let forceRecipient = null
    try {
        const body = await readBody(event)
        if (body?.forceRecipient) forceRecipient = body.forceRecipient
    } catch (e) { /* ignore body parse error for GET requests or empty body */ }

    // Parse report emails (comma-separated list)
    let reportEmailList = config.reportEmail
        ? config.reportEmail.split(',').map((e: string) => e.trim()).filter(Boolean)
        : []

    // Override if testing
    if (forceRecipient) {
        reportEmailList = [forceRecipient]
        console.log(`[Daily Report] 🧪 TEST MODE: Sending only to ${forceRecipient}`)
    }

    if (reportEmailList.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'No report emails configured. Set NUXT_REPORT_EMAIL in .env'
        })
    }

    console.log('[Daily Report] Gathering stats...')
    const stats = await gatherDailyStats()
    console.log('[Daily Report] Stats gathered:', JSON.stringify(stats, null, 2))

    // Prepare Template Data
    const subject = forceRecipient
        ? `[TEST] 📊 ILYTAT Daily Report - ${stats.date}`
        : `📊 ILYTAT Daily Report - ${stats.date}`

    // Create HTML Lists
    const newUsersList = formatListToHtml('🆕 New Arrivals:', stats.users.newUsersDetails, '#4ADE80')
    const subsList = formatListToHtml('🌟 Current Subscribers:', stats.users.subscribersDetails, '#FACC15')

    const dynamicTemplateData = {
        title: subject,
        date: stats.date,

        users_total: stats.users.total,
        users_new: stats.users.newToday,
        users_subscribers: stats.users.subscribers,
        users_team: stats.users.creators + stats.users.admins,
        users_new_list: newUsersList,
        users_subscribers_list: subsList, // Note: Ensure template handles this if not used

        posts_total: stats.posts.total,
        posts_new: stats.posts.newToday,
        posts_by_type: Object.entries(stats.posts.byType).map(([k, v]) => `${k}: ${v}`).join(', '),

        deals_total: stats.brandDeals.total,
        deals_pending: stats.brandDeals.pending,

        suggestions_total: stats.suggestions.total,
        suggestions_new: stats.suggestions.newToday,

        tasks_new: stats.developerTasks.newToday,
        tasks_open: stats.developerTasks.open,
        tasks_progress: stats.developerTasks.inProgress,
        tasks_done: stats.developerTasks.done,

        resets_individual: stats.quotaResets.individualToday,
        resets_global: stats.quotaResets.globalToday
    }

    // Send to each recipient
    const results: { email: string; success: boolean; error?: string }[] = []

    for (const email of reportEmailList) {
        try {
            console.log(`[Daily Report] Sending to ${email}...`)
            await $fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    Authorization: authHeader || ''
                },
                body: {
                    to: email,
                    subject,
                    templateId: config.emailjs?.dailyReportTemplateId, // Use specific template
                    dynamicTemplateData
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
