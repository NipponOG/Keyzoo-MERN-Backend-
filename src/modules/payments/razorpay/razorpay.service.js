'use strict';

const razorpayClient = require('./razorpay.client');

async function createCheckoutOrder({
    orderNumber,
    amount,
    currency,
}) {
    if (!orderNumber) {
        const error = new Error(
            'Keyzoo order number is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    const normalizedAmount = Number(amount);

    if (
        !Number.isFinite(normalizedAmount) ||
        normalizedAmount <= 0
    ) {
        const error = new Error(
            'Valid payment amount is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        typeof currency !== 'string' ||
        !currency.trim()
    ) {
        const error = new Error(
            'Valid payment currency is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    const normalizedCurrency =
        currency.trim().toUpperCase();

    /*
     * Razorpay expects the amount in the
     * smallest currency unit.
     *
     * INR 1499.00 -> 149900 paise
     */
    const amountInSmallestUnit =
        Math.round(normalizedAmount * 100);

    if (amountInSmallestUnit <= 0) {
        const error = new Error(
            'Payment amount is too small for Razorpay.'
        );

        error.statusCode = 400;

        throw error;
    }

    const razorpayOrder =
        await razorpayClient.createOrder({
            amount: amountInSmallestUnit,
            currency: normalizedCurrency,
            receipt: orderNumber,
        });

    if (!razorpayOrder?.id) {
        const error = new Error(
            'Razorpay did not return a valid order.'
        );

        error.statusCode = 502;
        error.razorpayResponse = razorpayOrder;

        throw error;
    }

    return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
        receipt: razorpayOrder.receipt ?? orderNumber,
    };
}

async function getRazorpayOrder(orderId) {
    return razorpayClient.getOrder(orderId);
}

async function getOrderPayments(orderId) {
    return razorpayClient.getOrderPayments(orderId);
}

async function getPayment(paymentId) {
    return razorpayClient.getPayment(paymentId);
}

module.exports = {
    createCheckoutOrder,
    getRazorpayOrder,
    getOrderPayments,
    getPayment,
};