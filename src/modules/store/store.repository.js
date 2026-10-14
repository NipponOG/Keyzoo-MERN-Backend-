'use strict';

const { getDatabase } = require('../../config/database');

const PRODUCTS_COLLECTION = 'products';

function getProductsCollection() {
    return getDatabase().collection(PRODUCTS_COLLECTION);
}

/**
 * Find all published products for the Store page.
 *
 * This is separate from product.repository.js so existing
 * product endpoints and their behavior remain unchanged.
 */
async function findPublishedProducts() {
    return getProductsCollection()
        .find({
            type: 'product',
            status: 'published',
        })
        .sort({
            createdAt: -1,
        })
        .toArray();
}

async function findPublishedGiftCards() {
    return getDatabase()
        .collection('gift_cards')
        .find({
            type: 'gift-card',
            status: 'published',
        })
        .sort({
            createdAt: -1,
        })
        .toArray();
}

module.exports = {
    findPublishedProducts,
    findPublishedGiftCards,
};