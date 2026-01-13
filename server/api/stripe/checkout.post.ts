import Stripe from 'stripe'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    logger.info('Stripe Checkout Endpoint Called')

    const body = await readBody(event)
    logger.debug('Checkout Request Body:', { ...body, priceId: '***' }) // Mask priceId just in case, or show it if safe. IDs are generally safe.

    if (!body.userId || !body.priceId) {
        logger.warn('Missing userId or priceId in checkout request', body)
        throw createError({ statusCode: 400, message: 'Missing userId or priceId' })
    }

    if (body.priceId.startsWith('prod_')) {
        logger.warn('Invalid Price ID Format (prod_)', { priceId: body.priceId })
        throw createError({
            statusCode: 400,
            message: 'Invalid Price ID: You provided a Product ID ("prod_..."). Please check your Stripe Dashboard and copy the API ID for the *Price* (usually starts with "price_" or "plan_").'
        })
    }

    const stripe = new Stripe(config.stripeSecretKey)

    try {
        logger.info('Creating Stripe Checkout Session', { userId: body.userId, priceId: body.priceId })

        const session = await stripe.checkout.sessions.create({
            client_reference_id: body.userId,
            line_items: [
                {
                    price: body.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: (body.successUrl || 'http://localhost:3000/feed?payment_success=true') + '&session_id={CHECKOUT_SESSION_ID}',
            cancel_url: body.cancelUrl || 'http://localhost:3000/feed',
        })

        logger.info('Stripe Checkout Session Created Successfully', { sessionId: session.id, url: session.url })
        return { url: session.url }
    } catch (e: any) {
        logger.error('Stripe Checkout Error', { message: e.message, type: e.type, code: e.code })
        throw createError({
            statusCode: 500,
            message: `Stripe Error: ${e.message}`,
            data: e
        })
    }
})
