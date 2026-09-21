'use strict';

const { getDatabase } = require('../../config/database');

const PRODUCTS_COLLECTION = 'products';
const GIFT_CARDS_COLLECTION = 'gift_cards';

function getProductsCollection() {
    return getDatabase().collection(PRODUCTS_COLLECTION);
}

function getGiftCardsCollection() {
    return getDatabase().collection(GIFT_CARDS_COLLECTION);
}

async function searchProducts(query, limit = 8) {
    return getProductsCollection()
        .find({
            type: 'product',
            status: 'published',
            title: {
                $regex: query,
                $options: 'i',
            },
        })
        .project({
            _id: 1,
            title: 1,
            slug: 1,
            image: 1,
            region: 1,
            price: 1,
            discountPrice: 1,
            currency: 1,
        })
        .sort({
            createdAt: -1,
        })
        .limit(limit)
        .toArray();
}

async function searchGiftCards(query, limit = 8) {
    return getGiftCardsCollection()
        .find({
            type: 'gift-card',
            status: 'published',
            title: {
                $regex: query,
                $options: 'i',
            },
        })
        .project({
            _id: 1,
            title: 1,
            slug: 1,
            image: 1,
            region: 1,
            price: 1,
            discountPrice: 1,
            currency: 1,
        })
        .sort({
            createdAt: -1,
        })
        .limit(limit)
        .toArray();
}

module.exports = {
    searchProducts,
    searchGiftCards,
};