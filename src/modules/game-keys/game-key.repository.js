'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const { createGameKeyDocument } = require('./game-key.schema');

const COLLECTION = 'game_keys';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

// Find a single game key by MongoDB _id
async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
    });
}

// Find a game key by its unique code
async function findByCode(code) {
    return getCollection().findOne({
        code,
    });
}

// Assign an available key to a product
async function assignAvailableProductKey(productId) {
    const objectId = toObjectId(productId);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            productId: objectId,
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

// Assign an available key to a gift card
async function assignAvailableGiftCardKey(giftCardId) {
    const objectId = toObjectId(giftCardId);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            giftCardId: objectId,
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

// Get all keys belonging to a product
async function findByProductId(productId) {
    const objectId = toObjectId(productId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            productId: objectId,
        })
        .sort({
            createdAt: -1,
        })
        .toArray();
}

// Get all keys belonging to a gift card
async function findByGiftCardId(giftCardId) {
    const objectId = toObjectId(giftCardId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            giftCardId: objectId,
        })
        .sort({
            createdAt: -1,
        })
        .toArray();
}

// Create one game key
async function create(gameKeyData) {
    const document = createGameKeyDocument(gameKeyData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

// Create multiple game keys
async function createMany(gameKeys) {
    if (
        !Array.isArray(gameKeys) ||
        gameKeys.length === 0
    ) {
        return [];
    }

    const documents = gameKeys.map(
        createGameKeyDocument
    );

    const result = await getCollection().insertMany(
        documents
    );

    return documents.map(
        (document, index) => ({
            ...document,
            _id: result.insertedIds[index],
        })
    );
}

// Delete a game key by MongoDB _id
async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: objectId,
    });
}

module.exports = {
    findById,
    findByCode,

    assignAvailableProductKey,
    assignAvailableGiftCardKey,

    findByProductId,
    findByGiftCardId,

    create,
    createMany,

    deleteById,
};