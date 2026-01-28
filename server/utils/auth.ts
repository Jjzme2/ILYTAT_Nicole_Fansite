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

export const requireAdmin = async (event: any) => {
    const config = useRuntimeConfig()
    const authHeader = getRequestHeader(event, 'Authorization')

    // 1. Check System Secret (Service-to-Service)
    if (config.adminSecret && authHeader === `Bearer ${config.adminSecret}`) {
        return { role: 'admin', uid: 'system' }
    }

    // 2. Check User Token (Client-to-Service)
    // getUserFromEvent will throw 401 if token is missing/invalid
    const user = await getUserFromEvent(event)

    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: Admin access required'
        })
    }

    return user
}
