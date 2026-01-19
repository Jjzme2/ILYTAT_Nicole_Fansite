import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
    max: 500,
    ttl: 1000 * 60 * 5, // 5 minutes
    allowStale: false,
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return []
    }

    // Deduplicate
    const uniqueIds = [...new Set(userIds)] as string[]

    // Identify which IDs are missing from cache
    const missingIds = uniqueIds.filter(id => !cache.has(id))

    // Fetch missing IDs from DB
    if (missingIds.length > 0) {
        const { db } = useFirebaseAdmin()
        const refs = missingIds.map(id => db.collection('users').doc(id))

        try {
            const snapshots = await db.getAll(...refs)

            snapshots.forEach(snap => {
                if (!snap.exists) {
                    // Cache the miss (null) to prevent repeated DB hits for non-existent users
                    cache.set(snap.id, null)
                    return
                }
                const data = snap.data()

                // Calculate Tier Server-Side
                let tier = 'Member'
                if (data?.isSubscriber) tier = 'Subscriber'
                if (data?.role === 'admin') tier = 'Admin'
                if (data?.role === 'creator') tier = 'Creator'

                // Return ONLY safe public info
                const profile = {
                    userId: snap.id,
                    tier: tier,
                    isSubscriber: data?.isSubscriber || false, // In case we need it specifically
                    role: data?.role || 'user'
                }
                cache.set(snap.id, profile)
            })

        } catch (e) {
            console.error('Error fetching public profiles:', e)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to fetch profiles'
            })
        }
    }

    // Return values from cache
    return uniqueIds
        .map(id => cache.get(id))
        .filter(u => u !== null && u !== undefined)
})
