'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const redis = require('../../config/redis');

const HANDOFF_PREFIX = 'oauth:handoff:';
const HANDOFF_TTL_SECONDS = 60;

async function createHandoffCode(userId, provider) {
    const code = uuidv4();

    const codeHash = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

    const key = `${HANDOFF_PREFIX}${codeHash}`;

    await redis.set(
        key,
        JSON.stringify({
            userId: userId.toString(),
            provider,
        }),
        'EX',
        HANDOFF_TTL_SECONDS
    );

    return code;
}

async function consumeHandoffCode(code) {
    if (!code) {
        return null;
    }

    const codeHash = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

    const key = `${HANDOFF_PREFIX}${codeHash}`;

    const data = await redis.get(key);

    if (!data) {
        return null;
    }

    await redis.del(key);

    return JSON.parse(data);
}

module.exports = {
    createHandoffCode,
    consumeHandoffCode,
};