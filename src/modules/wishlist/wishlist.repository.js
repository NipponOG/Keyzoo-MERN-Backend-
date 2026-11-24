'use strict';

const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../config/database');

const COLLECTION = 'wishlists';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}


async function ensureIndexes() {
    await getCollection().createIndex({ userId: 1 }, { unique: true });
}

async function findByUserId(userId) {
    return getCollection().findOne({ userId });
}

async function ensureWishlist(userId) {
    await getCollection().updateOne(
        { userId },
        {
            $setOnInsert: {
                userId,
                items: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );
}

async function addItem(userId, itemId, itemType) {
    await ensureWishlist(userId);

    return getCollection().updateOne(
        {
            userId,
            items: {
                $not: {
                    $elemMatch: { itemId, itemType },
                },
            },
        },
        {
            $push: { items: { itemId, itemType, addedAt: new Date() } },
            $set: { updatedAt: new Date() },
        }
    );
}

async function removeItem(userId, itemId, itemType) {
    return getCollection().updateOne(
        { userId },
        {
            $pull: { items: { itemId, itemType } },
            $set: { updatedAt: new Date() },
        }
    );
}

module.exports = {
    ensureIndexes,
    findByUserId,
    addItem,
    removeItem,
};
