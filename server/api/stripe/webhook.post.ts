import Stripe from 'stripe'
import { readBody, getHeader, createError } from 'h3'
import { useFirebaseAdmin } from '../../utils/firebaseAdmin'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const stripe = new Stripe(config.stripeSecretKey)

    const signature = getHeader(event, 'stripe-signature')
    const body = await readRawBody(event)

    logger.info('Stripe Webhook Received')

    if (!signature || !body) {
        logger.warn('Webhook missing signature or body')
        throw createError({ statusCode: 400, message: 'Missing signature or body' })
    }

    let stripeEvent: Stripe.Event

    try {
        stripeEvent = stripe.webhooks.constructEvent(
            body,
            signature,
            config.stripeWebhookSecret
        )
        logger.info('Webhook Signature Verified', { eventId: stripeEvent.id, type: stripeEvent.type })
    } catch (err: any) {
        logger.error('Webhook Verification Error', { message: err.message })
        throw createError({ statusCode: 400, message: `Webhook Error: ${err.message}` })
    }

    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string

        logger.info('Processing checkout.session.completed', {
            sessionId: session.id,
            userId,
            customerId,
            paymentStatus: session.payment_status
        })

        if (userId) {
            try {
                const { db } = useFirebaseAdmin()
                logger.info('Updating Firestore for user', { userId, collection: 'users' })

                await db.collection('users').doc(userId).set({
                    isSubscriber: true,
                    stripeCustomerId: customerId,
                    lastUpdated: new Date()
                }, { merge: true })

                logger.info('Firestore update successful', { userId })
            } catch (error: any) {
                logger.error('Firestore Update Error', error)
                throw createError({ statusCode: 500, message: 'DB Update Failed' })
            }
        } else {
            logger.warn('No userId found in session.client_reference_id - cannot link subscription to user', { sessionId: session.id })
        }
    } else {
        logger.info(`Unhandled Webhook Event Type: ${stripeEvent.type}`)
    }

    return { received: true }
})
