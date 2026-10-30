
'use strict';

const crypto = require('crypto');
const redis = require('../../config/redis');

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 30 * 60;
const WINDOW_SECONDS = 30 * 60;

function createIdentifier(email, ipAddress) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedIp = String(ipAddress || 'unknown').trim();

    return crypto
        .createHash('sha256')
        .update(`${normalizedEmail}:${normalizedIp}`)
        .digest('hex');
}

async function getLockStatus(email, ipAddress) {
    const identifier = createIdentifier(email, ipAddress);
    const lockKey = `auth:admin:login:lock:${identifier}`;

    const ttl = await redis.ttl(lockKey);

    return {
        locked: ttl > 0,
        retryAfter: Math.max(ttl, 0),
    };
}

async function recordFailure(email, ipAddress) {
    const identifier = createIdentifier(email, ipAddress);

    const counterKey = `auth:admin:login:attempts:${identifier}`;
    const lockKey = `auth:admin:login:lock:${identifier}`;

    const result = await redis.eval(
        `
        local count = redis.call('INCR', KEYS[1])

        if count == 1 then
            redis.call('EXPIRE', KEYS[1], ARGV[1])
        end

        if count >= tonumber(ARGV[2]) then
            redis.call('SET', KEYS[2], '1', 'EX', ARGV[3])
        end

        return {count, redis.call('TTL', KEYS[2])}
        `,
        2,
        counterKey,
        lockKey,
        WINDOW_SECONDS,
        MAX_ATTEMPTS,
        LOCK_DURATION_SECONDS
    );

    return {
        attempts: Number(result[0]),
        locked: Number(result[1]) > 0,
        retryAfter: Math.max(Number(result[1]), 0),
    };
}

async function clearFailures(email, ipAddress) {
    const identifier = createIdentifier(email, ipAddress);

    await redis.del(
        `auth:admin:login:attempts:${identifier}`,
        `auth:admin:login:lock:${identifier}`
    );
}

module.exports = {
    getLockStatus,
    recordFailure,
    clearFailures,
};
