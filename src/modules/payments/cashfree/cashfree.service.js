'use strict';

const cashfreeClient = require('./cashfree.client');

async function createCheckoutOrder({
    orderNumber,
    amount,
    currency,
    customerId,
    customerEmail,
    customerPhone,
    returnUrl,
    notifyUrl,
}) {
    if (!orderNumber) {
        throw new Error(
            'Keyzoo order number is required.'
        );
    }

    const normalizedAmount = Number(amount);

    if (
        !Number.isFinite(normalizedAmount) ||
        normalizedAmount <= 0
    ) {
        throw new Error(
            'Valid payment amount is required.'
        );
    }

    if (
        typeof currency !== 'string' ||
        !currency.trim()
    ) {
        throw new Error(
            'Valid payment currency is required.'
        );
    }

    if (!customerId) {
        throw new Error(
            'Cashfree customer ID is required.'
        );
    }

    if (!customerPhone) {
        throw new Error(
            'Customer phone is required for Cashfree.'
        );
    }

    if (!returnUrl) {
        throw new Error(
            'Cashfree return URL is required.'
        );
    }

    if (!notifyUrl) {
        throw new Error(
            'Cashfree webhook URL is required.'
        );
    }

    const normalizedCurrency =
        currency.trim().toUpperCase();

    const cashfreeOrder =
        await cashfreeClient.createOrder({
            order_id: orderNumber,
            order_amount: Number(
                normalizedAmount.toFixed(2)
            ),
            order_currency: normalizedCurrency,

            customer_details: {
                customer_id: customerId,
                ...(customerEmail
                    ? {
                        customer_email:
                            customerEmail,
                    }
                    : {}),
                customer_phone:
                    customerPhone,
            },

            order_meta: {
                return_url: returnUrl,
                notify_url: notifyUrl,
            },
        });

    if (
        !cashfreeOrder?.order_id ||
        !cashfreeOrder?.payment_session_id
    ) {
        const error = new Error(
            'Cashfree did not return a valid payment session.'
        );

        error.statusCode = 502;
        error.cashfreeResponse =
            cashfreeOrder;

        throw error;
    }

    return {
        orderId: cashfreeOrder.order_id,
        cfOrderId:
            cashfreeOrder.cf_order_id ?? null,
        paymentSessionId:
            cashfreeOrder.payment_session_id,
        orderStatus:
            cashfreeOrder.order_status ?? null,
    };
}

async function getOrderPayments(orderId) {
    return cashfreeClient.getOrderPayments(
        orderId
    );
}

async function getCashfreeOrder(orderId) {
    return cashfreeClient.getOrder(orderId);
}

module.exports = {
    createCheckoutOrder,
    getOrderPayments,
    getCashfreeOrder,
};