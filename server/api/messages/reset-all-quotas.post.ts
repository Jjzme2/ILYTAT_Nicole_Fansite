/**
 * Global Reset Messaging Quotas API
 * 
 * Allows a creator/admin to reset the daily message quota for ALL users.
 * Logs the action for the daily report.
 */

import { FieldValue } from 'firebase-admin/firestore'
import { getUserFromEvent } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event)

    // Security Check: Only admin can reset ALL quotas
    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: 'Unauthorized: Admin access required'
        })
    }

    const { db } = useFirebaseAdmin()

    try {
        console.log('[GlobalReset] Starting global quota reset...')

        // 1. Fetch all users
        const usersSnapshot = await db.collection('users').get()
        const totalUsers = usersSnapshot.size
        const today = new Date().toISOString().split('T')[0]

        // 2. Perform batch update for better performance
        const batch = db.batch()

        usersSnapshot.docs.forEach(userDoc => {
            const userData = userDoc.data()
            const dailyCap = userData.messagingQuota?.dailyCap || 3

            batch.update(userDoc.ref, {
                'messagingQuota.remaining': dailyCap,
                'messagingQuota.lastResetDate': today
            })
        })

        await batch.commit()

        // 3. Log the global reset event
        await db.collection('quota_resets').add({
            isGlobal: true,
            totalUsersAffected: totalUsers,
            resetBy: 'admin',
            timestamp: new Date(),
            createdAt: new Date()
        })

        console.log(`[GlobalReset] Successfully reset quotas for ${totalUsers} users.`)

        return {
            success: true,
            message: `Global quota reset complete for ${totalUsers} users.`
        }

    } catch (err: any) {
        console.error('[GlobalReset] Error:', err)
        throw createError({
            statusCode: 500,
            message: `Failed to perform global reset: ${err.message}`
        })
    }
})
