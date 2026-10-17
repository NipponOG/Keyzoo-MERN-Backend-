
'use strict';

const { getDatabase } = require('../../config/database');
const gameKeyRepository = require('../game-keys/game-key.repository');

const PRODUCTS_COLLECTION = 'products';
const GIFT_CARDS_COLLECTION = 'gift_cards';

function getProductsCollection() {
    return getDatabase().collection(PRODUCTS_COLLECTION);
}

function getGiftCardsCollection() {
    return getDatabase().collection(GIFT_CARDS_COLLECTION);
}

/**
 * Find published products and attach their actual available key counts.
 */
async function findPublishedProducts() {
    const products = await getProductsCollection()
        .find({
            type: 'product',
            status: 'published',
        })
        .sort({
            createdAt: -1,
        })
        .toArray();

    return Promise.all(
        products.map(async (product) => {
            const availableStock =
                await gameKeyRepository.countAvailableProductKeys(
                    product._id.toString()
                );

            return {
                ...product,
                availableStock,
                available: availableStock > 0,
            };
        })
    );
}

/**
 * Find published gift cards and attach their actual available key counts.
 */
async function findPublishedGiftCards() {
    const giftCards = await getGiftCardsCollection()
        .find({
            type: 'gift-card',
            status: 'published',
        })
        .sort({
            createdAt: -1,
        })
        .toArray();

    return Promise.all(
        giftCards.map(async (giftCard) => {
            const availableStock =
                await gameKeyRepository.countAvailableGiftCardKeys(
                    giftCard._id.toString()
                );

            return {
                ...giftCard,
                availableStock,
                available: availableStock > 0,
            };
        })
    );
}

module.exports = {
    findPublishedProducts,
    findPublishedGiftCards,
};
