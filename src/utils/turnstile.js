'use strict';

const env = require('../config/env');

async function verifyTurnstileToken(token, remoteIp) {

    if (
        process.env.NODE_ENV === 'development' &&
        token === 'DEV_TEST_TOKEN'
    ) {
        return true;
    }

    if (!token) {
        return false;
    }

    if (!env.turnstile.secretKey) {
        throw new Error('TURNSTILE_SECRET_KEY is not configured');
    }

    const formData = new URLSearchParams();

    formData.append('secret', env.turnstile.secretKey);
    formData.append('response', token);

    if (remoteIp) {
        formData.append('remoteip', remoteIp);
    }

    const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error('Turnstile verification request failed');
    }

    const result = await response.json();

    return result.success === true;
}

module.exports = {
    verifyTurnstileToken,
};