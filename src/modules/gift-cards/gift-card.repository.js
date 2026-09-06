'use strict';

const { getDatabase } = require('../../config/database');
const { createGiftCardDocument } = require('./gift-card.schema');

const COLLECTION = 'gift_cards';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'gift-card',
    });
}

async function findByLegacyId(legacyId) {
    return getCollection().findOne({
        legacyId: Number(legacyId),
        type: 'gift-card',
    });
}

async function create(giftCardData) {
    const document = createGiftCardDocument(giftCardData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

module.exports = {
    findBySlug,
    findByLegacyId,
    create,
};