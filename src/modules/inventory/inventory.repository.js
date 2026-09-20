'use strict';

const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../config/database');

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

const PRODUCTS_COLLECTION = 'products';
const GIFT_CARDS_COLLECTION = 'gift_cards';
const GAME_KEYS_COLLECTION = 'game_keys';

function getProductsCollection() {
    return getDatabase().collection(PRODUCTS_COLLECTION);
}

function getGiftCardsCollection() {
    return getDatabase().collection(GIFT_CARDS_COLLECTION);
}

function getGameKeysCollection() {
    return getDatabase().collection(GAME_KEYS_COLLECTION);
}

async function getProducts() {
    return getProductsCollection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

async function getGiftCards() {
    return getGiftCardsCollection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

async function getGameKeyCounts() {
    return getGameKeysCollection()
        .aggregate([
            {
                $match: {
                    $or: [
                        {
                            productId: {
                                $type: 'objectId',
                            },
                        },
                        {
                            giftCardId: {
                                $type: 'objectId',
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    productId: 1,
                    giftCardId: 1,
                    isAvailable: 1,
                },
            },
            {
                $group: {
                    _id: {
                        productId: '$productId',
                        giftCardId: '$giftCardId',
                    },

                    totalKeys: {
                        $sum: 1,
                    },

                    availableKeys: {
                        $sum: {
                            $cond: [
                                '$isAvailable',
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ])
        .toArray();
}

async function bulkDeleteItems(items) {
    const db = getDatabase();

    const productsCollection =
        db.collection(PRODUCTS_COLLECTION);

    const giftCardsCollection =
        db.collection(GIFT_CARDS_COLLECTION);

    const gameKeysCollection =
        db.collection(GAME_KEYS_COLLECTION);

    const deleted = [];
    const blocked = [];

    for (const item of items) {
        const collection =
            item.type === 'gift-card'
                ? giftCardsCollection
                : productsCollection;

        const objectId = toObjectId(item.id);

        if (!objectId) {
            blocked.push({
                id: item.id,
                type: item.type,
                reason: 'Invalid ID',
            });

            continue;
        }

        const document = await collection.findOne({
            _id: objectId,
            type: item.type,
        });

        if (!document) {
            blocked.push({
                id: item.id,
                type: item.type,
                reason: 'Item not found',
            });

            continue;
        }

        const keyFilter =
            item.type === 'gift-card'
                ? { giftCardId: objectId }
                : { productId: objectId };

        const assignedKeys =
            await gameKeysCollection.countDocuments({
                ...keyFilter,
                isAvailable: false,
            });

        if (assignedKeys > 0) {
            blocked.push({
                id: item.id,
                type: item.type,
                reason: 'Item has assigned or sold keys',
            });

            continue;
        }

        await collection.deleteOne({
            _id: objectId,
            type: item.type,
        });

        deleted.push({
            id: item.id,
            type: item.type,
        });
    }

    return {
        deleted,
        blocked,
    };
}

module.exports = {
    getProducts,
    getGiftCards,
    getGameKeyCounts,
    bulkDeleteItems,
};