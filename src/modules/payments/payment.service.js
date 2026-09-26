'use strict';

const stripeService = require('./stripe/stripe.service');

async function createStripeCheckout({
    orderNumber,
    amount,
    currency,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
}) {
    if (!orderNumber) {
        const error = new Error(
            'Order number is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        const error = new Error(
            'Valid payment amount is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        typeof currency !== 'string' ||
        !currency.trim()
    ) {
        const error = new Error(
            'Valid currency is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!customerEmail) {
        const error = new Error(
            'Customer email is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!successUrl || !cancelUrl) {
        const error = new Error(
            'Success URL and cancel URL are required'
        );

        error.statusCode = 400;
        throw error;
    }

    return stripeService.createCheckoutSession({
        orderNumber,
        amount: Number(amount),
        currency: currency.trim(),
        customerEmail,
        successUrl,
        cancelUrl,
        metadata,
    });
}

module.exports = {
    createStripeCheckout,
};