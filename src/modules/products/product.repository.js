'use strict';

const { getDatabase } = require('../../config/database');
const { createProductDocument } = require('./product.schema');

const COLLECTION = 'products';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'product',
    });
}

async function findByLegacyId(legacyId) {
    return getCollection().findOne({
        legacyId: Number(legacyId),
        type: 'product',
    });
}


async function create(productData) {
    const document = createProductDocument(productData);

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