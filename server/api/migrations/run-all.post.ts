/**
 * Master Schema Migration Script
 * 
 * Scans all core collections and ensures every document conforms to the latest schema definitions.
 * Populates missing fields with safe default values.
 * 
 * Collections handled:
 * - users
 * - posts
 * - brand_deals
 * - giveaways (and subcollection: rounds)
 * - tasks
 * - system_messages
 * - notifications
 * 
 * Run via: npm run migrate (or POST /api/migrations/run-all)
 */

import { FieldValue } from 'firebase-admin/firestore'

// --- SCHEMA DEFINITIONS ---
const SCHEMAS = {
    users: {
        role: 'user',
        isSubscriber: false,
        isVerified: false,
        displayName: '',
        photoURL: null,
        fullName: null, // New
        birthday: null, // New
        stripeCustomerId: null,
        preferences: { // Ensure object exists
            theme: 'default',
            emailNotifications: true
        },
        messagingQuota: {
            remaining: 3,
            totalSent: 0,
            dailyCap: 3,
            lastResetDate: null
        }
    },
    posts: {
        caption: '',
        type: 'image',
        isFree: false,
        likeCount: 0,
        commentCount: 0
    },
    brand_deals: {
        status: 'pending',
        value: '',
        contactName: '',
        notes: ''
    },
    giveaways: {
        // Campaign defaults
        image: null,
        description: ''
    },
    tasks: {
        status: 'todo',
        priority: 'med',
        type: 'feature',
        section: 'Active Tasks (Engineering)'
    },
    system_messages: {
        isActive: false,
        type: 'info',
        style: 'toast',
        dismissible: true
    },
    notifications: {
        read: false,
        type: 'alert'
    }
}

// Subcollection targets: collection -> subcollection -> schema
const SUB_SCHEMAS = {
    giveaways: {
        sub: 'rounds',
        schema: {
            status: 'scheduled',
            winner: null
        }
    }
}

export default defineEventHandler(async (event) => {
    const { db } = useFirebaseAdmin()
    const config = useRuntimeConfig()

    // Auth check (Dev or Secret)
    const isDev = process.dev
    const authHeader = getHeader(event, 'authorization')

    // Use runtimeConfig.adminSecret instead of process.env
    // We allow dev mode bypass, but in production (or if !isDev) we require the adminSecret
    if (!isDev && (!config.adminSecret || authHeader !== `Bearer ${config.adminSecret}`)) {
        throw createError({ statusCode: 403, message: 'Unauthorized migration' })
    }

    const results = {
        collections: {} as Record<string, any>,
        totalUpdated: 0
    }

    console.log('🚀 Starting Master Migration...')

    try {
        // 1. Process Top-Level Collections
        for (const [colName, defaults] of Object.entries(SCHEMAS)) {
            console.log(`Processing collection: ${colName}...`)
            const snapshot = await db.collection(colName).get()

            const colResult = {
                total: snapshot.size,
                updated: 0,
                errors: 0
            }

            for (const doc of snapshot.docs) {
                const data = doc.data()
                const updates: Record<string, any> = {}
                let needsUpdate = false

                // Check defaults
                for (const [key, defaultVal] of Object.entries(defaults)) {
                    if (data[key] === undefined) {
                        updates[key] = defaultVal
                        needsUpdate = true
                    } else if (typeof defaultVal === 'object' && defaultVal !== null && !Array.isArray(defaultVal)) {
                        // Shallow object check (like preferences)
                        if (typeof data[key] !== 'object') {
                            updates[key] = defaultVal
                            needsUpdate = true
                        } else {
                            // Check keys inside the object
                            const subUpdates = {}
                            let subChanged = false
                            for (const [subKey, subVal] of Object.entries(defaultVal)) {
                                if (data[key][subKey] === undefined) {
                                    subUpdates[subKey] = subVal
                                    subChanged = true
                                }
                            }
                            if (subChanged) {
                                updates[key] = { ...data[key], ...subUpdates }
                                needsUpdate = true
                            }
                        }
                    }
                }

                if (needsUpdate) {
                    updates.migratedAt = FieldValue.serverTimestamp()
                    updates.schemaVersion = 2 // Bump version
                    try {
                        await doc.ref.update(updates)
                        colResult.updated++
                    } catch (e) {
                        colResult.errors++
                        console.error(`Error updating ${colName}/${doc.id}:`, e)
                    }
                }
            }

            results.collections[colName] = colResult
            results.totalUpdated += colResult.updated
        }

        // 2. Process Subcollections (like giveaways/rounds)
        for (const [parentCol, config] of Object.entries(SUB_SCHEMAS)) {
            console.log(`Processing subcollection: ${parentCol} -> ${config.sub}...`)
            const parents = await db.collection(parentCol).get()

            let subUpdated = 0

            for (const parentDoc of parents.docs) {
                const subRef = parentDoc.ref.collection(config.sub)
                const subSnap = await subRef.get()

                for (const subDoc of subSnap.docs) {
                    const data = subDoc.data()
                    const updates: Record<string, any> = {}
                    let needsUpdate = false

                    for (const [key, defaultVal] of Object.entries(config.schema)) {
                        if (data[key] === undefined) {
                            updates[key] = defaultVal
                            needsUpdate = true
                        }
                    }

                    if (needsUpdate) {
                        await subDoc.ref.update(updates)
                        subUpdated++
                    }
                }
            }
            results.collections[`${parentCol}/${config.sub}`] = { updated: subUpdated }
            results.totalUpdated += subUpdated
        }

        console.log('✅ Master Migration Complete', results)
        return { success: true, results }

    } catch (e: any) {
        console.error('Migration Failed:', e)
        throw createError({ statusCode: 500, message: e.message })
    }
})
