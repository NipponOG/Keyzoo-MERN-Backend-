
'use strict';

const { getDatabase } = require('../../config/database');

const COLLECTION = 'admin_passkey_challenges';
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function save(userId, challenge, purpose = 'registration') {
    if (!['registration', 'authentication'].includes(purpose)) {
        throw new Error('Invalid passkey challenge purpose');
    }

    const now = new Date();

    await getCollection().updateOne(
        { userId, purpose },
        {
            $set: {
                challenge,
                purpose,
                expiresAt: new Date(now.getTime() + CHALLENGE_TTL_MS),
                createdAt: now,
            },
        },
        { upsert: true }
    );
}

async function consume(userId, purpose = 'registration') {
    if (!['registration', 'authentication'].includes(purpose)) {
        throw new Error('Invalid passkey challenge purpose');
    }

    const now = new Date();

    const result = await getCollection().findOneAndDelete({
        userId,
        purpose,
        expiresAt: { $gt: now },
    });

    // MongoDB driver versions differ in their findOneAndDelete return shape.
    return result?.value ?? result ?? null;
}

async function ensureIndexes() {
    await getCollection().createIndex(
        { userId: 1, purpose: 1 },
        { unique: true }
    );

    await getCollection().createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
    );
}

module.exports = {
    save,
    consume,
    ensureIndexes,
};
