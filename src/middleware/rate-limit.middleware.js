
'use strict';

const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

const redis = require('../config/redis');

function createRateLimiter({
    windowMs = 60 * 1000,
    limit = 100,
    prefix = 'rate-limit',
    message = 'Too many requests. Please try again later.',
} = {}) {
    return rateLimit({
        windowMs,
        limit,

        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args),
            prefix: `${prefix}:`,
        }),

        standardHeaders: 'draft-8',
        legacyHeaders: false,

        handler: (req, res) => {
            const retryAfter = Math.ceil(windowMs / 1000);

            res.set('Retry-After', String(retryAfter));

            return res.status(429).json({
                success: false,
                message,
                retryAfter,
            });
        },
    });
}

module.exports = {
    createRateLimiter,
};
