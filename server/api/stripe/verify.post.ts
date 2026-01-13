import Stripe from 'stripe'
import { logger } from '../../utils/logger'
import { useFirebaseAdmin } from '../../utils/firebaseAdmin'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { sessionId, userId } = body

    logger.info('Verification Request Received', { sessionId, userId })

    if (!sessionId || !userId) {
        throw createError({ statusCode: 400, message: 'Missing sessionId or userId' })
    }

    const stripe = new Stripe(config.stripeSecretKey)

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        logger.info('Stripe Session Retrieved', { status: session.status, paymentStatus: session.payment_status })

        if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
            // Verify client reference matches
            if (session.client_reference_id !== userId) {
                logger.warn('Session client_reference_id mismatch', { sessionUser: session.client_reference_id, requestUser: userId })
                throw createError({ statusCode: 403, message: 'User mismatch' })
            }

            const { db } = useFirebaseAdmin()
            const customerId = session.customer as string

            logger.info('Updating Firestore via Verification Endpoint', { userId })

            await db.collection('users').doc(userId).set({
                isSubscriber: true,
                stripeCustomerId: customerId,
                lastUpdated: new Date(),
                lastVerifiedAt: new Date()
            }, { merge: true })

            return { success: true, isSubscriber: true }
        } else {
            logger.warn('Session not paid', { status: session.payment_status })
            return { success: false, isSubscriber: false, status: session.payment_status }
        }

    } catch (e: any) {
        logger.error('Verification Failed', e)
        throw createError({ statusCode: 500, message: e.message })
    }
})
