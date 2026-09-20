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

async function findPublishedBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'gift-card',
        status: 'published',
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

async function findPublishedByGroupId(giftCardGroupId) {
    const objectId = toObjectId(giftCardGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            giftCardGroupId: objectId,
            type: 'gift-card',
            status: 'published',
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

async function findPublishedRecommended(limit = 12) {
    return getCollection()
        .find({
            type: 'gift-card',
            status: 'published',
            isRecommended: true,
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

async function findPublishedBestSelling(limit = 30) {
    return getCollection()
        .find({
            type: 'gift-card',
            status: 'published',
            isBestSeller: true,
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

// Delete a gift card by MongoDB _id
async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: objectId,
        type: 'gift-card',
    });
}

module.exports = {
    findBySlug,
    findPublishedBySlug,
    findById,
    findPublishedByGroupId,
    findByGroupId,
    findPublishedRecommended,
    findPublishedBestSelling,
    create,
    updateById,
    createMany,
    deleteById,
};