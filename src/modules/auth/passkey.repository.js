
'use strict';

const { getDatabase } = require('../../config/database');

const COLLECTION = 'admin_passkeys';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function create(passkey) {
    const now = new Date();

    const document = {
        userId: passkey.userId,
        credentialId: passkey.credentialId,
        publicKey: passkey.publicKey,
        counter: passkey.counter ?? 0,
        transports: passkey.transports ?? [],
        deviceType: passkey.deviceType ?? 'unknown',
        backedUp: passkey.backedUp ?? false,
        name: passkey.name ?? 'My passkey',
        createdAt: now,
        updatedAt: now,
        lastUsedAt: null,
    };

    await getCollection().insertOne(document);

    return {
        ...document,
        _id: undefined,
    };
}

async function findByCredentialId(credentialId) {
    return getCollection().findOne({ credentialId });
}

async function findByUserId(userId) {
    return getCollection()
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
}

async function updateCounter(credentialId, counter, backedUp) {
    return getCollection().updateOne(
        { credentialId },
        {
            $set: {
                counter,
                backedUp,
                lastUsedAt: new Date(),
                updatedAt: new Date(),
            },
        }
    );
}

async function removeById(userId, id) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return { deletedCount: 0 };
    }

    return getCollection().deleteOne({
        _id: new ObjectId(id),
        userId,
    });
}

async function ensureIndexes() {
    await getCollection().createIndex(
        { credentialId: 1 },
        { unique: true }
    );

    await getCollection().createIndex({ userId: 1, createdAt: -1 });
}

module.exports = {
    create,
    findByCredentialId,
    findByUserId,
    updateCounter,
    removeById,
    ensureIndexes,
};
