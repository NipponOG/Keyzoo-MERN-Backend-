'use strict';

require('dotenv').config({ path: '.env.local', });

const CASHFREE_API_VERSION = '2025-01-01';

async function main() {
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment =
        process.env.CASHFREE_ENVIRONMENT || 'sandbox';

    if (!appId || !secretKey) {
        throw new Error(
            'CASHFREE_APP_ID or CASHFREE_SECRET_KEY is missing.'
        );
    }

    const baseUrl =
        environment === 'production'
            ? 'https://api.cashfree.com/pg'
            : 'https://sandbox.cashfree.com/pg';

    const orderId =
        `KZ-TEST-${Date.now()}`;

    const response = await fetch(
        `${baseUrl}/orders`,
        {
            method: 'POST',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version':
                    CASHFREE_API_VERSION,
                Accept: 'application/json',
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({
                order_amount: 1,
                order_currency: 'INR',
                order_id: orderId,
                customer_details: {
                    customer_id: 'keyzoo_test_user',
                    customer_phone: '9999999999',
                },
                order_meta: {
                    return_url:
                        'http://localhost:3000/checkout/success?order_id={order_id}',
                },
            }),
        }
    );

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    console.log(
        'Cashfree HTTP status:',
        response.status
    );

    console.log(
        'Cashfree response:',
        JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
        process.exitCode = 1;
        return;
    }

    console.log('');
    console.log(
        '✅ Cashfree API credentials are working.'
    );

    console.log(
        'Cashfree Order ID:',
        data.order_id
    );

    console.log(
        'Payment Session ID:',
        data.payment_session_id
    );
}

main().catch((error) => {
    console.error(
        '❌ Cashfree test failed:',
        error.message
    );

    process.exitCode = 1;
});