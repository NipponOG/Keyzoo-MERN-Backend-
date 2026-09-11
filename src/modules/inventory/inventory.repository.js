'use strict';

const { getDatabase } = require('../../config/database');

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

module.exports = {
    getProducts,
    getGiftCards,
    getGameKeyCounts,
};