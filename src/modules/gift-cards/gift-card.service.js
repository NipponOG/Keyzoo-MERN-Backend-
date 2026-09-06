'use strict';

const repository = require('./gift-card.repository');

async function getGiftCardBySlug(slug) {
    if (!slug) {
        const error = new Error('Gift Card slug is required');
        error.statusCode = 400;
        throw error;
    }

    const giftCard = await repository.findBySlug(slug);

    if (!giftCard) {
        const error = new Error('Gift Card not found');
        error.statusCode = 404;
        throw error;
    }

    return giftCard;
}

module.exports = {
    getGiftCardBySlug,
};