'use strict';

const { getDatabase } = require('../../config/database');
const { createGameKeyDocument } = require('./game-key.schema');

const COLLECTION = 'game_keys';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findByLegacyId(legacyId) {
    return getCollection().findOne({
        legacyId: Number(legacyId),
    });
}

async function findByCode(code) {
    return getCollection().findOne({
        code,
    });
}

async function assignAvailableKey(ownerType, ownerId) {
    const collection = getCollection();

    return collection.findOneAndUpdate(
        {
            ownerType,
            ownerId: Number(ownerId),
            isAvailable: true,
        },
        {
            $set: {
                isAvailable: false,
                assignedAt: new Date(),
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function create(gameKeyData) {
    const document = createGameKeyDocument(gameKeyData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

module.exports = {
    findByLegacyId,
    findByCode,
    create,
    assignAvailableKey,
};