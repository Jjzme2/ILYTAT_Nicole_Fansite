import { useFirebaseAdmin } from '../../utils/firebaseAdmin'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const secret = getHeader(event, 'x-admin-secret')

    if (!config.adminSecret || secret !== config.adminSecret) {
        logger.warn('Unauthorized migration attempt')
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const { db } = useFirebaseAdmin()
    const query = getQuery(event)
    const adminEmail = query.admin_email as string

    logger.info('Starting User Migration...')

    try {
        const usersRef = db.collection('users')
        const snapshot = await usersRef.get()

        let updatedCount = 0
        const batch = db.batch()
        let operationCount = 0 // Batches are limited to 500 ops

        for (const doc of snapshot.docs) {
            const data = doc.data()
            const updates: any = {}
            let needsUpdate = false

            // 1. Backfill Role
            if (!data.role) {
                if (adminEmail && data.email === adminEmail) {
                    updates.role = 'admin'
                    logger.info(`Promoting ${data.email} to ADMIN`)
                } else {
                    updates.role = 'user'
                }
                needsUpdate = true
            }

            // 2. Backfill Subscriber Status
            if (typeof data.isSubscriber === 'undefined') {
                updates.isSubscriber = false
                needsUpdate = true
            }

            // 3. Backfill Timestamps if missing
            if (!data.createdAt) {
                updates.createdAt = new Date()
                needsUpdate = true
            }

            if (needsUpdate) {
                batch.update(doc.ref, updates)
                updatedCount++
                operationCount++

                // Commit batch if limit reached (safety net)
                if (operationCount >= 450) {
                    await batch.commit()
                    operationCount = 0
                }
            }
        }

        if (operationCount > 0) {
            await batch.commit()
        }

        logger.info(`Migration Complete. Updated ${updatedCount} users.`)
        return {
            success: true,
            message: `Migration complete. Updated ${updatedCount} users.`,
            updatedCount
        }

    } catch (e: any) {
        logger.error('Migration Failed', e)
        throw createError({ statusCode: 500, message: e.message })
    }
})
