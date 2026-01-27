import { getAuth } from 'firebase-admin/auth'
import { useFirebaseAdmin } from './firebaseAdmin'

// Helper to extract the token from headers
const getToken = (event: any) => {
    const authHeader = getRequestHeader(event, 'Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }
    return authHeader.split('Bearer ')[1]
}

export const getUserFromEvent = async (event: any) => {
    const token = getToken(event)
    if (!token) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: No token provided'
        })
    }

    try {
        const { db } = useFirebaseAdmin()

        // 1. Verify the ID token
        const decodedToken = await getAuth().verifyIdToken(token)
        const userId = decodedToken.uid

        // 2. Fetch the user document for latest role/status
        // Note: Claims on the token might be stale, so we check DB for critical ops
        const userSnap = await db.collection('users').doc(userId).get()

        if (!userSnap.exists) {
            throw createError({
                statusCode: 404,
                message: 'User profile not found'
            })
        }

        const userData = userSnap.data()

        // Return a unified user object
        return {
            uid: userId,
            email: decodedToken.email,
            role: userData?.role || 'user',
            isSubscriber: userData?.isSubscriber || false,
            ...userData
        }

    } catch (error: any) {
        console.error('Auth Error:', error)
        throw createError({
            statusCode: 401,
            message: 'Unauthorized: Invalid token'
        })
    }
}

/**
 * Enforces Admin access via either:
 * 1. Bearer token matching NUXT_ADMIN_SECRET (for cron/system calls)
 * 2. Firebase Auth with 'admin' role (for user calls)
 */
export const requireAdmin = async (event: any) => {
    const config = useRuntimeConfig()
    const authHeader = getRequestHeader(event, 'Authorization')
    const secret = config.adminSecret

    // 1. Check strict Bearer token (System/Cron access)
    if (secret && authHeader === `Bearer ${secret}`) {
        return true
    }

    // 2. Check User Role (Admin access)
    try {
        const user = await getUserFromEvent(event)
        if (user.role === 'admin') {
            return true
        }
    } catch (e) {
        // Ignore auth errors here, fail later if not authorized
    }

    throw createError({
        statusCode: 401,
        message: 'Unauthorized: Admin access required.'
    })
}
