'use strict';

require('dotenv').config();

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

    strapi: {
        url: process.env.STRAPI_URL,
        token: process.env.STRAPI_TOKEN,
    },
};

if (!env.mongodb.uri) {
    throw new Error('MONGODB_URI is not defined');
}

module.exports = env;