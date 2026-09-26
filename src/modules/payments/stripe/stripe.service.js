'use strict';

const stripe = require('./stripe.client');

async function createCheckoutSession({
    orderNumber,
    amount,
    currency,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
}) {
    if (!orderNumber) {
        throw new Error('Order number is required');
    }

    if (!amount || Number(amount) <= 0) {
        throw new Error('Valid payment amount is required');
    }

    if (
        typeof currency !== 'string' ||
        !currency.trim()
    ) {
        throw new Error(
            'Valid currency is required'
        );
    }

    const normalizedCurrency =
        currency.trim().toLowerCase();

    if (!customerEmail) {
        throw new Error('Customer email is required');
    }

    if (!successUrl || !cancelUrl) {
        throw new Error(
            'Success URL and cancel URL are required'
        );
    }

    const session =
        await stripe.checkout.sessions.create({
            mode: 'payment',

            customer_email: customerEmail,

            line_items: [
                {
                    price_data: {
                        currency: normalizedCurrency,

                        product_data: {
                            name: `Keyzoo Order ${orderNumber}`,
                        },

                        unit_amount: Math.round(
                            Number(amount) * 100
                        ),
                    },

                    quantity: 1,
                },
            ],

            metadata: {
                orderNumber,
                ...metadata,
            },

            success_url: successUrl,
            cancel_url: cancelUrl,
        });

    return {
        id: session.id,
        url: session.url,
        status: session.status,
        paymentStatus:
            session.payment_status,
    };
}

module.exports = {
    createCheckoutSession,
};