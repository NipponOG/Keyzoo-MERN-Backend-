
'use strict';

require('dotenv').config({ path: '.env.local' });

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 5000,

    mongodb: {
        uri: process.env.MONGODB_URI,
        database: process.env.MONGODB_DATABASE || 'keyzoo',
    },

    turnstile: {
        secretKey: process.env.TURNSTILE_SECRET_KEY,
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },

    discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },

    resend: {
        apiKey: process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL,
    },

    payments: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },

        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
        },

        cashfree: {
            appId: process.env.CASHFREE_APP_ID,
            secretKey: process.env.CASHFREE_SECRET_KEY,
            environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox',
        },
    },
};

function requireEnv(name, value) {
    if (!value || !value.trim()) {
        throw new Error(`${name} is not defined`);
    }
}

requireEnv('MONGODB_URI', env.mongodb.uri);

requireEnv('GOOGLE_CLIENT_ID', env.google.clientId);
requireEnv('GOOGLE_CLIENT_SECRET', env.google.clientSecret);

requireEnv('DISCORD_CLIENT_ID', env.discord.clientId);
requireEnv('DISCORD_CLIENT_SECRET', env.discord.clientSecret);

requireEnv('RESEND_API_KEY', env.resend.apiKey);
requireEnv('RESEND_FROM_EMAIL', env.resend.fromEmail);

if (!['development', 'production', 'test'].includes(env.nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${env.nodeEnv}`);
}

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error('PORT must be a valid port number');
}

if (!['sandbox', 'production'].includes(env.payments.cashfree.environment)) {
    throw new Error('Invalid CASHFREE_ENVIRONMENT');
}

module.exports = env;
