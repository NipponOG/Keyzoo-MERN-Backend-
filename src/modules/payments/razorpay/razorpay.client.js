'use strict';

const env = require('../../../config/env');

const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

function getAuthHeader() {
    const keyId = env.payments.razorpay.keyId;
    const keySecret = env.payments.razorpay.keySecret;

    if (!keyId || !keySecret) {
        const error = new Error(
            'Razorpay API credentials are not configured.'
        );

        error.statusCode = 500;

        throw error;
    }

    const credentials = Buffer.from(
        `${keyId}:${keySecret}`
    ).toString('base64');

    return `Basic ${credentials}`;
}

async function razorpayRequest(
    path,
    {
        method = 'GET',
        body,
    } = {}
) {
    const response = await fetch(
        `${RAZORPAY_BASE_URL}${path}`,
        {
            method,
            headers: {
                Authorization: getAuthHeader(),
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
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
            data?.error?.description ||
            data?.error?.reason ||
            data?.message ||
            'Razorpay API request failed.'
        );

        error.statusCode = response.status;
        error.razorpayResponse = data;

        throw error;
    }

    return data;
}

async function createOrder(orderData) {
    return razorpayRequest('/orders', {
        method: 'POST',
        body: orderData,
    });
}

async function getOrder(orderId) {
    if (!orderId) {
        const error = new Error(
            'Razorpay order ID is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    return razorpayRequest(
        `/orders/${encodeURIComponent(orderId)}`
    );
}

async function getOrderPayments(orderId) {
    if (!orderId) {
        const error = new Error(
            'Razorpay order ID is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    return razorpayRequest(
        `/orders/${encodeURIComponent(orderId)}/payments`
    );
}

async function getPayment(paymentId) {
    if (!paymentId) {
        const error = new Error(
            'Razorpay payment ID is required.'
        );

        error.statusCode = 400;

        throw error;
    }

    return razorpayRequest(
        `/payments/${encodeURIComponent(paymentId)}`
    );
}

module.exports = {
    createOrder,
    getOrder,
    getOrderPayments,
    getPayment,
};