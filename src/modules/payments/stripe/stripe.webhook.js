'use strict';

const stripe = require('./stripe.client');
const env = require('../../../config/env');
const orderRepository = require('../../orders/order.repository');

function verifyStripeWebhook(req) {
    const signature =
        req.headers['stripe-signature'];

    if (!signature) {
        const error = new Error(
            'Stripe webhook signature is missing.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!env.payments.stripe.webhookSecret) {
        const error = new Error(
            'STRIPE_WEBHOOK_SECRET is not configured.'
        );

        error.statusCode = 500;
        throw error;
    }

    return stripe.webhooks.constructEvent(
        req.body,
        signature,
        env.payments.stripe.webhookSecret
    );
}

async function handleCheckoutSessionCompleted(
    session
) {
    const orderNumber =
        session.metadata?.orderNumber;

    if (!orderNumber) {
        console.error(
            '❌ Stripe checkout session is missing orderNumber metadata:',
            session.id
        );

        return;
    }

    const order =
        await orderRepository.findByOrderNumber(
            orderNumber
        );

    if (!order) {
        console.error(
            '❌ Keyzoo order not found for Stripe session:',
            {
                orderNumber,
                sessionId: session.id,
            }
        );

        return;
    }

    console.log(
        '✅ Keyzoo order matched with Stripe session:',
        {
            orderNumber,
            sessionId: session.id,
        }
    );

    /*
     * Idempotency:
     * Stripe may deliver the same webhook more than once.
     */
    if (
        order.paymentStatus === 'paid'
    ) {
        console.log(
            'ℹ️ Order is already marked as paid:',
            orderNumber
        );

        return;
    }

    /*
     * Make sure this order cannot be linked
     * to a different Stripe Checkout Session.
     */
    if (
        order.stripeSessionId &&
        order.stripeSessionId !== session.id
    ) {
        const error = new Error(
            'Stripe Checkout Session does not match the order.'
        );

        error.statusCode = 409;

        throw error;
    }

    /*
     * Stripe must report the Checkout Session
     * as paid before we confirm the order.
     */
    if (
        session.payment_status !== 'paid'
    ) {
        console.error(
            '❌ Stripe Checkout Session is not paid:',
            {
                orderNumber,
                sessionId: session.id,
                paymentStatus:
                    session.payment_status,
            }
        );

        return;
    }

    /*
     * Verify the amount received by Stripe
     * against the amount stored in MongoDB.
     */
    const expectedAmount =
        Math.round(
            Number(order.totalAmount) * 100
        );

    const receivedAmount =
        Number(session.amount_total);

    if (
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(receivedAmount) ||
        expectedAmount !== receivedAmount
    ) {
        const error = new Error(
            'Stripe payment amount does not match the order amount.'
        );

        error.statusCode = 409;

        console.error(
            '❌ Stripe amount mismatch:',
            {
                orderNumber,
                expectedAmount,
                receivedAmount,
            }
        );

        throw error;
    }

    /*
     * Verify currency.
     */
    const expectedCurrency =
        String(order.currency || '')
            .trim()
            .toLowerCase();

    const receivedCurrency =
        String(session.currency || '')
            .trim()
            .toLowerCase();

    if (
        !expectedCurrency ||
        !receivedCurrency ||
        expectedCurrency !== receivedCurrency
    ) {
        const error = new Error(
            'Stripe payment currency does not match the order currency.'
        );

        error.statusCode = 409;

        console.error(
            '❌ Stripe currency mismatch:',
            {
                orderNumber,
                expectedCurrency,
                receivedCurrency,
            }
        );

        throw error;
    }

    const updatedOrder =
        await orderRepository.updateByOrderNumber(
            orderNumber,
            {
                paymentStatus: 'paid',
                paymentProvider: 'stripe',

                stripeSessionId: session.id,

                stripePaymentIntentId:
                    typeof session.payment_intent ===
                        'string'
                        ? session.payment_intent
                        : null,

                paymentMethod:
                    Array.isArray(
                        session.payment_method_types
                    ) &&
                        session.payment_method_types.length
                        ? session
                            .payment_method_types[0]
                        : null,
            }
        );

    if (!updatedOrder) {
        const error = new Error(
            'Failed to update paid order.'
        );

        error.statusCode = 500;

        throw error;
    }

    console.log(
        '✅ Keyzoo order marked as paid:',
        {
            orderNumber,
            paymentStatus:
                updatedOrder.paymentStatus,
            stripeSessionId:
                updatedOrder.stripeSessionId,
        }
    );
}

async function handleStripeWebhook(
    req,
    res,
    next
) {
    try {
        const event =
            verifyStripeWebhook(req);

        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(
                    event.data.object
                );

                break;

            default:
                console.log(
                    `ℹ️ Ignoring Stripe event: ${event.type}`
                );
        }

        return res.status(200).json({
            received: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    handleStripeWebhook,
};