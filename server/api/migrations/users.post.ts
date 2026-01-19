/**
 * User Migration Script
 * 
 * Updates all existing users with default values for any missing fields.
 * Preserves existing values - only sets defaults where fields are undefined.
 * 
 * Run via: POST /api/migrations/users
 * 
 * Requires admin authentication or dev mode.
 */

import { FieldValue } from 'firebase-admin/firestore'

// Default values for user fields
const USER_DEFAULTS = {
    // Core fields
    role: 'user',
    isSubscriber: false,
    isVerified: false,

    // Profile fields
    displayName: null,
    photoURL: null,
    bio: '',
    socials: {},

    // Stripe linking
    stripeCustomerId: null,

    // Timestamps
    lastUpdated: null,
    updatedAt: null,
    lastVerifiedAt: null,

    // Preferences
    preferences: {
        theme: 'default',
        emailNotifications: true,
        pushNotifications: false
    },

    // Messaging quota - resets daily
    messagingQuota: {
        remaining: 3,
        totalSent: 0,
        dailyCap: 3,          // Store cap on user for per-user customization
        lastResetDate: null
    }
}

export default defineEventHandler(async (event) => {
    const { db } = useFirebaseAdmin()
    const config = useRuntimeConfig()

    // Security: Only allow in dev mode or with admin token
    // In production, you'd want proper authentication here
    const isDev = process.dev
    const authHeader = getHeader(event, 'authorization')

    if (!isDev && (!config.adminSecret || authHeader !== `Bearer ${config.adminSecret}`)) {
        throw createError({
            statusCode: 403,
            message: 'Migration requires dev mode or valid adminSecret'
        })
    }

    const results = {
        total: 0,
        updated: 0,
        skipped: 0,
        errors: [] as { uid: string; error: string }[],
        details: [] as { uid: string; fieldsSet: string[] }[]
    }

    try {
        // Fetch all users
        const usersSnapshot = await db.collection('users').get()
        results.total = usersSnapshot.size

        console.log(`[Migration] Starting user migration for ${results.total} users...`)

        // Process each user
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data()
            const uid = userDoc.id
            const updates: Record<string, any> = {}
            const fieldsSet: string[] = []

            // Check each default field
            for (const [field, defaultValue] of Object.entries(USER_DEFAULTS)) {
                const existingValue = userData[field]

                if (existingValue === undefined) {
                    // Total missing field
                    updates[field] = defaultValue
                    fieldsSet.push(field)
                } else if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
                    // Object exists, but check for missing sub-fields (shallow merge)
                    const subUpdates: Record<string, any> = {}
                    let subFieldAdded = false

                    for (const [subKey, subDefault] of Object.entries(defaultValue)) {
                        if (existingValue[subKey] === undefined) {
                            subUpdates[subKey] = subDefault
                            fieldsSet.push(`${field}.${subKey}`)
                            subFieldAdded = true
                        }
                    }

                    if (subFieldAdded) {
                        updates[field] = {
                            ...existingValue,
                            ...subUpdates
                        }
                    }
                }
            }

            // If there are updates to make
            if (Object.keys(updates).length > 0) {
                try {
                    // Add migration timestamp
                    updates.migratedAt = FieldValue.serverTimestamp()
                    updates.migrationVersion = 1

                    await db.collection('users').doc(uid).update(updates)
                    results.updated++
                    results.details.push({ uid, fieldsSet })

                    console.log(`[Migration] Updated user ${uid}: set ${fieldsSet.join(', ')}`)
                } catch (err: any) {
                    results.errors.push({ uid, error: err.message })
                    console.error(`[Migration] Error updating user ${uid}:`, err.message)
                }
            } else {
                results.skipped++
            }
        }

        console.log(`[Migration] Complete: ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors`)

        return {
            success: true,
            message: `Migration complete: ${results.updated} users updated, ${results.skipped} already up-to-date`,
            results
        }

    } catch (err: any) {
        console.error('[Migration] Fatal error:', err)
        throw createError({
            statusCode: 500,
            message: `Migration failed: ${err.message}`
        })
    }
})
