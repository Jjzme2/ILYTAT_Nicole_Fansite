export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return []
    }

    // Deduplicate
    const uniqueIds = [...new Set(userIds)]
    // Limit batch size if needed, but 100 is safe for now

    const { db } = useFirebaseAdmin()
    const refs = uniqueIds.map(id => db.collection('users').doc(id))

    try {
        const snapshots = await db.getAll(...refs)

        return snapshots.map(snap => {
            if (!snap.exists) return null
            const data = snap.data()

            // Calculate Tier Server-Side
            let tier = 'Member'
            if (data?.isSubscriber) tier = 'Subscriber'
            if (data?.role === 'admin') tier = 'Admin'
            if (data?.role === 'creator') tier = 'Creator'

            // Return ONLY safe public info
            return {
                userId: snap.id,
                tier: tier,
                isSubscriber: data?.isSubscriber || false, // In case we need it specifically
                role: data?.role || 'user'
            }
        }).filter(u => u !== null)

    } catch (e) {
        console.error('Error fetching public profiles:', e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch profiles'
        })
    }
})
