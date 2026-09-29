'use strict';

const crypto = require('crypto');

const env = require('../../../config/env');

const cashfreeService = require('./cashfree.service');

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

function verifyCashfreeSignature({
    rawBody,
    signature,
    timestamp,
}) {
    if (!rawBody || !signature || !timestamp) {
        return false;
    }

    const secretKey =
        env.payments.cashfree.secretKey;

    if (!secretKey) {
        const error = new Error(
            'Cashfree secret key is not configured.'
        );

        error.statusCode = 500;
        throw error;
    }

    const signedPayload =
        `${timestamp}${rawBody}`;

    const expectedSignature =
        crypto
            .createHmac('sha256', secretKey)
            .update(signedPayload)
            .digest('base64');

    const expectedBuffer =
        Buffer.from(expectedSignature, 'utf8');

    const receivedBuffer =
        Buffer.from(signature, 'utf8');

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

function parseCashfreeWebhook(req) {
    const rawBody = getRawBody(req);

    if (!rawBody) {
        const error = new Error(
            'Cashfree webhook raw body is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    const signature =
        req.headers['x-webhook-signature'];

    const timestamp =
        req.headers['x-webhook-timestamp'];

    if (!signature || !timestamp) {
        const error = new Error(
            'Missing Cashfree webhook signature headers.'
        );

        error.statusCode = 401;
        throw error;
    }

    const isValid =
        verifyCashfreeSignature({
            rawBody,
            signature,
            timestamp,
        });

    if (!isValid) {
        const error = new Error(
            'Invalid Cashfree webhook signature.'
        );

        error.statusCode = 401;
        throw error;
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        const error = new Error(
            'Invalid Cashfree webhook payload.'
        );

        error.statusCode = 400;
        throw error;
    }
}

async function handleCashfreeWebhook(
    req,
    res,
    next
) {
    try {
        const payload =
            parseCashfreeWebhook(req);

        console.log(
            '📥 Cashfree webhook received:',
            JSON.stringify(payload)
        );

        if (payload?.type === 'WEBHOOK') {
            console.log(
                '✅ Cashfree webhook endpoint test received.'
            );

            return res.status(200).json({
                success: true,
                message: 'Webhook endpoint is reachable.',
            });
        }

        const orderId =
            payload?.data?.order?.order_id;

        const payment =
            payload?.data?.payment;

        const paymentStatus =
            payment?.payment_status;

        const paymentId =
            payment?.cf_payment_id;

        if (payload?.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
            console.log(
                'ℹ️ Cashfree webhook event ignored:',
                payload?.type
            );

            return res.status(200).json({
                success: true,
                message: 'Webhook event ignored.',
            });
        }

        if (!orderId) {
            const error = new Error(
                'Cashfree webhook is missing order ID.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (!payment) {
            const error = new Error(
                'Cashfree webhook is missing payment data.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (paymentStatus !== 'SUCCESS') {
            console.log(
                'ℹ️ Cashfree payment is not successful:',
                {
                    orderId,
                    paymentStatus,
                    paymentId,
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Webhook received.',
            });
        }

        const order =
            await orderRepository.findByOrderNumber(
                orderId
            );

        if (!order) {
            const error = new Error(
                `Keyzoo order "${orderId}" was not found.`
            );

            error.statusCode = 404;
            throw error;
        }

        if (
            order.cashfreeOrderId &&
            order.cashfreeOrderId !== orderId
        ) {
            const error = new Error(
                'Cashfree order ID does not match the Keyzoo order.'
            );

            error.statusCode = 409;
            throw error;
        }

        const verifiedPayments =
            await cashfreeService.getOrderPayments(
                orderId
            );

        const successfulPayment =
            Array.isArray(verifiedPayments)
                ? verifiedPayments.find(
                    (item) =>
                        item?.payment_status ===
                        'SUCCESS' &&
                        item?.cf_payment_id?.toString() ===
                        paymentId?.toString()
                )
                : null;

        if (!successfulPayment) {
            console.warn(
                '⚠️ Cashfree webhook reported success, but server-side payment verification did not find a successful payment:',
                orderId
            );

            return res.status(200).json({
                success: true,
                message:
                    'Webhook received; payment verification is pending.',
            });
        }

        const verifiedAmount =
            Number(
                successfulPayment.payment_amount
            );

        const orderAmount =
            Number(order.totalAmount);

        if (
            !Number.isFinite(verifiedAmount) ||
            verifiedAmount !== orderAmount
        ) {
            const error = new Error(
                'Cashfree payment amount does not match the Keyzoo order.'
            );

            error.statusCode = 409;
            throw error;
        }

        const verifiedCurrency =
            (
                successfulPayment.payment_currency ||
                order.currency
            )
                .toString()
                .trim()
                .toUpperCase();

        const orderCurrency =
            order.currency
                .toString()
                .trim()
                .toUpperCase();

        if (
            verifiedCurrency !==
            orderCurrency
        ) {
            const error = new Error(
                'Cashfree payment currency does not match the Keyzoo order.'
            );

            error.statusCode = 409;
            throw error;
        }

        const updatedOrder =
            await orderRepository.markOrderPaid(
                orderId,
                {
                    cashfreePaymentId:
                        successfulPayment.cf_payment_id ??
                        paymentId ??
                        null,

                    paymentDetails:
                        successfulPayment,

                    paymentProvider:
                        'cashfree',

                    paymentMethod:
                        successfulPayment.payment_group ??
                        null,
                }
            );

        if (!updatedOrder) {
            const currentOrder =
                await orderRepository.findByOrderNumber(
                    orderId
                );

            if (
                currentOrder?.paymentStatus ===
                'paid' &&
                currentOrder?.cashfreeOrderId ===
                orderId
            ) {
                console.log(
                    'ℹ️ Cashfree webhook already processed:',
                    orderId
                );

                return res.status(200).json({
                    success: true,
                    message:
                        'Webhook already processed.',
                });
            }

            const error = new Error(
                'Failed to mark Cashfree order as paid.'
            );

            error.statusCode = 409;
            throw error;
        }

        console.log(
            '✅ Cashfree payment verified and order marked paid:',
            orderId
        );

        try {
            await fulfillPaidOrder(orderId);

            console.log(
                '✅ Cashfree order fulfillment completed:',
                orderId
            );
        } catch (fulfillmentError) {
            console.error(
                '❌ Cashfree payment succeeded but fulfillment failed:',
                {
                    orderId,
                    error:
                        fulfillmentError.message,
                }
            );

            // Payment is already confirmed.
            // The fulfillment service records manual
            // fulfillment state when automatic assignment fails.
        }

        return res.status(200).json({
            success: true,
            message: 'Cashfree payment processed.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    parseCashfreeWebhook,
    verifyCashfreeSignature,
    handleCashfreeWebhook,
};