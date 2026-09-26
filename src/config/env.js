'use strict';

require('dotenv').config({ path: '.env.local', });

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

    strapi: {
        url: process.env.STRAPI_URL,
        token: process.env.STRAPI_TOKEN,
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
            webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET,
        },
    },

};

if (!env.mongodb.uri) {
    throw new Error('MONGODB_URI is not defined');
}

if (!env.google.clientId || !env.google.clientSecret) {
    throw new Error(
        'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not defined'
    );
}

if (!env.discord.clientId || !env.discord.clientSecret) {
    throw new Error(
        'DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are not defined'
    );
}

module.exports = env;