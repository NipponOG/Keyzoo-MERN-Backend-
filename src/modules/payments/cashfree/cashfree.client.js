'use strict';

const env = require('../../../config/env');

const CASHFREE_API_VERSION = '2025-01-01';

function getBaseUrl() {
    return env.payments.cashfree.environment === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
}

function getHeaders() {
    const appId = env.payments.cashfree.appId;
    const secretKey = env.payments.cashfree.secretKey;

    if (!appId || !secretKey) {
        const error = new Error(
            'Cashfree API credentials are not configured.'
        );

        error.statusCode = 500;

        throw error;
    }

    return {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': CASHFREE_API_VERSION,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
}

async function cashfreeRequest(
    path,
    {
        method = 'GET',
        body,
    } = {}
) {
    const response = await fetch(
        `${getBaseUrl()}${path}`,
        {
            method,
            headers: getHeaders(),
            ...(body
                ? {
                    body: JSON.stringify(body),
                }
                : {}),
        }
    );

    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = {
            message: text,
        };
    }

    if (!response.ok) {
        const error = new Error(
            data?.message ||
            data?.message_text ||
            'Cashfree API request failed.'
        );

        error.statusCode = response.status;
        error.cashfreeResponse = data;

        throw error;
    }

    return data;
}

async function createOrder(orderData) {
    return cashfreeRequest('/orders', {
        method: 'POST',
        body: orderData,
    });
}

async function getOrder(orderId) {
    if (!orderId) {
        const error = new Error(
            'Cashfree order ID is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    return cashfreeRequest(
        `/orders/${encodeURIComponent(orderId)}`
    );
}

async function getOrderPayments(orderId) {
    if (!orderId) {
        const error = new Error(
            'Cashfree order ID is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    return cashfreeRequest(
        `/orders/${encodeURIComponent(orderId)}/payments`
    );
}

module.exports = {
    createOrder,
    getOrder,
    getOrderPayments,
};