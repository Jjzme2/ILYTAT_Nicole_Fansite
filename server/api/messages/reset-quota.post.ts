/**
 * Reset User Messaging Quota API
 * 
 * Allows a creator/admin to reset a specific user's daily message quota.
 * Logs the action for the daily report.
 */

import { serverTimestamp } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
    const { db } = useFirebaseAdmin()
    const { userId } = await readBody(event)

    if (!userId) {
        throw createError({
            statusCode: 400,
            message: 'User ID is required'
        })
    }

    try {
        // 1. Get current user data to see their cap
        const userRef = db.collection('users').doc(userId)
        const userDoc = await userRef.get()

        if (!userDoc.exists) {
            throw createError({
                statusCode: 404,
                message: 'User not found'
            })
        }

        const userData = userDoc.data() || {}
        const dailyCap = userData.messagingQuota?.dailyCap || 3

        // 2. Reset the quota
        await userRef.update({
            'messagingQuota.remaining': dailyCap,
            'messagingQuota.lastResetDate': new Date().toISOString().split('T')[0] // Use current date
        })

        // 3. Log the reset event for the daily report
        await db.collection('quota_resets').add({
            userId,
            userEmail: userData.email,
            resetBy: 'admin', // In a real app, you'd track WHICH admin
            timestamp: new Date(),
            createdAt: new Date()
        })

        return {
            success: true,
            message: `Quota reset to ${dailyCap} for user ${userData.email}`
        }

    } catch (err: any) {
        console.error('[ResetQuota] Error:', err)
        throw createError({
            statusCode: 500,
            message: `Failed to reset quota: ${err.message}`
        })
    }
})
