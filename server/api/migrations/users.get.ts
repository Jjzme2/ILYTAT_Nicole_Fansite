/**
 * User Migration Preview
 * 
 * Previews what the migration would do without making any changes.
 * Shows which users would be updated and what fields would be set.
 * 
 * Run via: GET /api/migrations/users
 */

// Default values for user fields (same as POST)
const USER_DEFAULTS = {
    role: 'user',
    isSubscriber: false,
    isVerified: false,
    displayName: null,
    photoURL: null,
    bio: '',
    socials: {},
    stripeCustomerId: null,
    lastUpdated: null,
    updatedAt: null,
    lastVerifiedAt: null,
    preferences: {
        theme: 'default',
        emailNotifications: true,
        pushNotifications: false
    },
    messagingQuota: {
        remaining: 3,
        totalSent: 0,
        dailyCap: 3,
        lastResetDate: null
    }
}

export default defineEventHandler(async (event) => {
    const { db } = useFirebaseAdmin()
    const config = useRuntimeConfig()

    // Security: Only allow in dev mode OR with admin secret
    const isDev = process.dev
    const authHeader = getHeader(event, 'authorization')
    const isAuthenticated = config.adminSecret && authHeader === `Bearer ${config.adminSecret}`

    if (!isDev && !isAuthenticated) {
        throw createError({
            statusCode: 403,
            message: 'Migration preview only available in dev mode or with admin authentication'
        })
    }

    const preview = {
        total: 0,
        wouldUpdate: 0,
        upToDate: 0,
        users: [] as {
            uid: string
            email: string
            currentFields: string[]
            missingFields: string[]
            wouldSet: Record<string, any>
        }[]
    }

    try {
        const usersSnapshot = await db.collection('users').get()
        preview.total = usersSnapshot.size

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data()
            const uid = userDoc.id
            const currentFields = Object.keys(userData)
            const missingFields: string[] = []
            const wouldSet: Record<string, any> = {}

            for (const [field, defaultValue] of Object.entries(USER_DEFAULTS)) {
                const existingValue = userData[field]

                if (existingValue === undefined) {
                    missingFields.push(field)
                    wouldSet[field] = defaultValue
                } else if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
                    const subUpdates: Record<string, any> = {}
                    let subFieldAdded = false

                    for (const [subKey, subDefault] of Object.entries(defaultValue)) {
                        if (existingValue[subKey] === undefined) {
                            subUpdates[subKey] = subDefault
                            missingFields.push(`${field}.${subKey}`)
                            subFieldAdded = true
                        }
                    }

                    if (subFieldAdded) {
                        wouldSet[field] = {
                            ...existingValue,
                            ...subUpdates
                        }
                    }
                }
            }

            if (missingFields.length > 0) {
                preview.wouldUpdate++
                preview.users.push({
                    uid,
                    email: userData.email || '(no email)',
                    currentFields,
                    missingFields,
                    wouldSet
                })
            } else {
                preview.upToDate++
            }
        }

        return {
            success: true,
            message: `Preview: ${preview.wouldUpdate} users would be updated, ${preview.upToDate} are up-to-date`,
            preview,
            defaults: USER_DEFAULTS
        }

    } catch (err: any) {
        throw createError({
            statusCode: 500,
            message: `Preview failed: ${err.message}`
        })
    }
})
