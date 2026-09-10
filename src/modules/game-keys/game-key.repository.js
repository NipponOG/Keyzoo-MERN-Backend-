'use strict';

const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../config/database');
const { createGameKeyDocument } = require('./game-key.schema');

const COLLECTION = 'game_keys';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function deleteById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: new ObjectId(id),
    });
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

async function findByOwner(ownerType, ownerId) {
    return getCollection()
        .find({
            ownerType,
            ownerId: Number(ownerId),
        })
        .sort({ createdAt: -1 })
        .toArray();
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

async function createMany(gameKeys) {
    if (!Array.isArray(gameKeys) || gameKeys.length === 0) {
        return [];
    }

    const documents = gameKeys.map(createGameKeyDocument);

    const result = await getCollection().insertMany(documents);

    return documents.map((document, index) => ({
        ...document,
        _id: result.insertedIds[index],
    }));
}

module.exports = {
    findByLegacyId,
    findByCode,
    create,
    assignAvailableKey,
    findByOwner,
    deleteById,
    createMany,
};