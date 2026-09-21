'use strict';

const repository = require('./search.repository');

async function search(query) {
    const normalizedQuery = String(query || '').trim();

    if (normalizedQuery.length < 3) {
        return [];
    }

    const [products, giftCards] = await Promise.all([
        repository.searchProducts(normalizedQuery, 8),
        repository.searchGiftCards(normalizedQuery, 8),
    ]);

    const normalizedProducts = products.map((product) => ({
        ...product,
        type: 'product',
    }));

    const normalizedGiftCards = giftCards.map((giftCard) => ({
        ...giftCard,
        type: 'gift-card',
    }));

    return [
        ...normalizedProducts,
        ...normalizedGiftCards,
    ];
}

module.exports = {
    search,
};