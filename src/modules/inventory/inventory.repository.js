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

async function getInventoryData() {
    const [products, giftCards, keyCounts] = await Promise.all([
        getProductsCollection()
            .find({})
            .project({
                legacyId: 1,
                title: 1,
                type: 1,
                image: 1,
                region: 1,
                card_region: 1,
                workPlatform: 1,
                item: 1,
            })
            .toArray(),

        getGiftCardsCollection()
            .find({})
            .project({
                legacyId: 1,
                title: 1,
                type: 1,
                image: 1,
                region: 1,
                card_region: 1,
                workPlatform: 1,
                item: 1,
            })
            .toArray(),

        getGameKeysCollection()
            .aggregate([
                {
                    $group: {
                        _id: {
                            ownerType: '$ownerType',
                            ownerId: '$ownerId',
                        },
                        totalKeys: {
                            $sum: 1,
                        },
                        availableKeys: {
                            $sum: {
                                $cond: ['$isAvailable', 1, 0],
                            },
                        },
                    },
                },
            ])
            .toArray(),
    ]);

    return {
        products,
        giftCards,
        keyCounts,
    };
}

module.exports = {
    getInventoryData,
};