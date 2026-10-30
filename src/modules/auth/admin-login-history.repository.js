
'use strict';

const { getDatabase } = require('../../config/database');
const { ObjectId } = require('mongodb');

const COLLECTION = 'admin_login_history';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function recordSuccessfulLogin({
    userId,
    ipAddress,
    userAgent,
    loginMethod = 'password',
    location = null,
}) {
    if (!ObjectId.isValid(userId)) {
        throw new Error('Valid admin user ID is required');
    }

    const event = {
        userId: new ObjectId(userId),
        event: 'login_success',
        loginMethod,
        ipAddress: ipAddress || null,
        location: location || null,
        userAgent: userAgent || null,
        createdAt: new Date(),
    };

    await getCollection().insertOne(event);

    return event;
}

async function findRecentLogins(userId, limit = 10) {
    if (!ObjectId.isValid(userId)) {
        return [];
    }

    const safeLimit = Math.max(
        1,
        Math.min(Number(limit) || 10, 50)
    );

    return getCollection()
        .find({
            userId: new ObjectId(userId),
            event: 'login_success',
        })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .toArray();
}

async function ensureIndexes() {
    await getCollection().createIndex({
        userId: 1,
        createdAt: -1,
    });
}

module.exports = {
    recordSuccessfulLogin,
    findRecentLogins,
    ensureIndexes,
};
