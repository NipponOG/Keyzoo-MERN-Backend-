'use strict';

const crypto = require('crypto');
const env = require('../../../config/env');
const razorpayService = require('./razorpay.service');
const orderRepository = require('../../orders/order.repository');

const {
    fulfillPaidOrder,
} = require('../../orders/order.fulfillment.service');

function getRawBody(req) {
    if (Buffer.isBuffer(req.body)) {
        return req.body.toString('utf8');
    }

    if (typeof req.body === 'string') {
        return req.body;
    }

    return null;
}

function verifyRazorpaySignature({
    rawBody,
    signature,
}) {
    if (!rawBody || !signature) {
        return false;
    }

    const webhookSecret =
        env.payments.razorpay.webhookSecret;

    if (!webhookSecret) {
        const error = new Error(
            'Razorpay webhook secret is not configured.'
        );

        error.statusCode = 500;

        throw error;
    }

    const expectedSignature =
        crypto
            .createHmac(
                'sha256',
                webhookSecret
            )
            .update(rawBody)
            .digest('hex');

    const expectedBuffer =
        Buffer.from(
            expectedSignature,
            'utf8'
        );

    const receivedBuffer =
        Buffer.from(
            signature,
            'utf8'
        );

    if (
        expectedBuffer.length !==
        receivedBuffer.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
    );
}

function parseRazorpayWebhook(req) {
    const rawBody = getRawBody(req);

    if (!rawBody) {
        const error = new Error(
            'Razorpay webhook raw body is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    const signature =
        req.headers['x-razorpay-signature'];

    if (!signature) {
        const error = new Error(
            'Missing Razorpay webhook signature.'
        );

        error.statusCode = 401;

        throw error;
    }

    const isValid =
        verifyRazorpaySignature({
            rawBody,
            signature,
        });

    if (!isValid) {
        const error = new Error(
            'Invalid Razorpay webhook signature.'
        );

        error.statusCode = 401;

        throw error;
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        const error = new Error(
            'Invalid Razorpay webhook payload.'
        );

        error.statusCode = 400;

        throw error;
    }
}

async function handleRazorpayWebhook(
    req,
    res,
    next
) {
    try {
        const payload =
            parseRazorpayWebhook(req);

        const razorpayEventId =
            req.headers['x-razorpay-event-id'];

        console.log(
            '📥 Razorpay webhook received:',
            JSON.stringify({
                eventId: razorpayEventId,
                event: payload?.event,
            })
        );

        if (
            payload?.event !==
            'payment.captured'
        ) {
            console.log(
                'ℹ️ Razorpay webhook event ignored:',
                payload?.event
            );

            return res.status(200).json({
                success: true,
                message:
                    'Webhook event ignored.',
            });
        }

        const payment =
            payload?.payload?.payment?.entity;

        const paymentId =
            payment?.id;

        const razorpayOrderId =
            payment?.order_id;

        if (!paymentId) {
            const error = new Error(
                'Razorpay webhook is missing payment ID.'
            );

            error.statusCode = 400;

            throw error;
        }

        if (!razorpayOrderId) {
            const error = new Error(
                'Razorpay webhook is missing order ID.'
            );

            error.statusCode = 400;

            throw error;
        }

        const paymentStatus =
            payment?.status;

        if (
            paymentStatus !==
            'captured'
        ) {
            console.log(
                'ℹ️ Razorpay payment is not captured:',
                {
                    paymentId,
                    razorpayOrderId,
                    paymentStatus,
                }
            );

            return res.status(200).json({
                success: true,
                message:
                    'Webhook received.',
            });
        }

        const keyzooOrder =
            await orderRepository.findByRazorpayOrderId(
                razorpayOrderId
            );

        if (!keyzooOrder) {
            const error = new Error(
                `Keyzoo order for Razorpay order "${razorpayOrderId}" was not found.`
            );

            error.statusCode = 404;

            throw error;
        }

        if (
            razorpayEventId &&
            keyzooOrder?.paymentDetails?.razorpayEventId ===
            razorpayEventId
        ) {
            console.log(
                'ℹ️ Razorpay webhook event already processed:',
                {
                    eventId: razorpayEventId,
                    orderNumber: keyzooOrder.orderNumber,
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Webhook event already processed.',
            });
        }

        if (
            keyzooOrder.razorpayOrderId &&
            keyzooOrder.razorpayOrderId !==
            razorpayOrderId
        ) {
            const error = new Error(
                'Razorpay order ID does not match the Keyzoo order.'
            );

            error.statusCode = 409;

            throw error;
        }

        /*
         * Server-side verification:
         * Fetch the Razorpay order and its payments
         * instead of trusting the webhook payload alone.
         */
        const verifiedOrder =
            await razorpayService.getRazorpayOrder(
                razorpayOrderId
            );

        if (
            verifiedOrder?.id !==
            razorpayOrderId
        ) {
            const error = new Error(
                'Razorpay order verification failed.'
            );

            error.statusCode = 409;

            throw error;
        }

        const verifiedPayments =
            await razorpayService.getOrderPayments(
                razorpayOrderId
            );

        const successfulPayment =
            Array.isArray(verifiedPayments?.items)
                ? verifiedPayments.items.find(
                    (item) =>
                        item?.id === paymentId &&
                        item?.status ===
                        'captured'
                )
                : null;

        if (!successfulPayment) {
            console.warn(
                '⚠️ Razorpay webhook reported captured payment, but server-side verification did not find the matching captured payment:',
                {
                    razorpayOrderId,
                    paymentId,
                }
            );

            return res.status(200).json({
                success: true,
                message:
                    'Webhook received; payment verification is pending.',
            });
        }

        const verifiedAmount =
            Number(
                successfulPayment.amount
            );

        const expectedAmount =
            Math.round(
                Number(
                    keyzooOrder.totalAmount
                ) * 100
            );

        if (
            !Number.isFinite(
                verifiedAmount
            ) ||
            verifiedAmount !==
            expectedAmount
        ) {
            const error = new Error(
                'Razorpay payment amount does not match the Keyzoo order.'
            );

            error.statusCode = 409;

            throw error;
        }

        const verifiedCurrency =
            (
                successfulPayment.currency ||
                verifiedOrder.currency
            )
                .toString()
                .trim()
                .toUpperCase();

        const orderCurrency =
            keyzooOrder.currency
                .toString()
                .trim()
                .toUpperCase();

        if (
            verifiedCurrency !==
            orderCurrency
        ) {
            const error = new Error(
                'Razorpay payment currency does not match the Keyzoo order.'
            );

            error.statusCode = 409;

            throw error;
        }

        const updatedOrder =
            await orderRepository.markOrderPaid(
                keyzooOrder.orderNumber,
                {
                    razorpayOrderId:
                        razorpayOrderId,

                    razorpayPaymentId:
                        paymentId,

                    paymentProvider:
                        'razorpay',

                    paymentMethod:
                        successfulPayment.method ??
                        null,

                    paymentDetails: {
                        ...successfulPayment,
                        razorpayEventId:
                            razorpayEventId ?? null,
                    },
                }
            );

        if (!updatedOrder) {
            const currentOrder =
                await orderRepository.findByOrderNumber(
                    keyzooOrder.orderNumber
                );

            if (
                currentOrder?.paymentStatus ===
                'paid' &&
                currentOrder?.razorpayOrderId ===
                razorpayOrderId &&
                currentOrder?.razorpayPaymentId ===
                paymentId
            ) {
                console.log(
                    'ℹ️ Razorpay webhook already processed:',
                    keyzooOrder.orderNumber
                );

                return res.status(200).json({
                    success: true,
                    message:
                        'Webhook already processed.',
                });
            }

            const error = new Error(
                'Failed to mark Razorpay order as paid.'
            );

            error.statusCode = 409;

            throw error;
        }

        console.log(
            '✅ Razorpay payment verified and order marked paid:',
            keyzooOrder.orderNumber
        );

        try {
            await fulfillPaidOrder(
                keyzooOrder.orderNumber
            );

            console.log(
                '✅ Razorpay order fulfillment completed:',
                keyzooOrder.orderNumber
            );
        } catch (fulfillmentError) {
            console.error(
                '❌ Razorpay payment succeeded but fulfillment failed:',
                {
                    orderNumber:
                        keyzooOrder.orderNumber,
                    error:
                        fulfillmentError.message,
                }
            );
        }

        return res.status(200).json({
            success: true,
            message:
                'Razorpay payment processed.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    parseRazorpayWebhook,
    verifyRazorpaySignature,
    handleRazorpayWebhook,
};