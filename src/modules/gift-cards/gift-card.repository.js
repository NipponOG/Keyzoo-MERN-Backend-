'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const { createGiftCardDocument } = require('./gift-card.schema');

const COLLECTION = 'gift_cards';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

async function findBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'gift-card',
    });
}

async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
        type: 'gift-card',
    });
}

async function findByGroupId(giftCardGroupId) {
    const objectId = toObjectId(giftCardGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            giftCardGroupId: objectId,
            type: 'gift-card',
        })
        .sort({ createdAt: 1 })
        .toArray();
}

async function create(giftCardData) {
    const document =
        createGiftCardDocument(giftCardData);

    const result =
        await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

async function updateById(id, updateData) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
        {
            _id: objectId,
            type: 'gift-card',
        },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );

    return result;
}

async function createMany(giftCards) {
    if (
        !Array.isArray(giftCards) ||
        giftCards.length === 0
    ) {
        return [];
    }

    const documents =
        giftCards.map(createGiftCardDocument);

    const result =
        await getCollection().insertMany(documents);

    return documents.map((document, index) => ({
        ...document,
        _id: result.insertedIds[index],
    }));
}

module.exports = {
    findBySlug,
    findById,
    findByGroupId,
    create,
    updateById,
    createMany,
};