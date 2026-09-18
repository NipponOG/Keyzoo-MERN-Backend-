'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const { createProductDocument } = require('./product.schema');

const COLLECTION = 'products';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
        type: 'product',
    });
}

async function findBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'product',
    });
}

async function findPublishedBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'product',
        status: 'published',
    });
}

async function findPublishedByGroupId(productGroupId) {
    const objectId = toObjectId(productGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            productGroupId: objectId,
            type: 'product',
            status: 'published',
        })
        .sort({ createdAt: 1 })
        .toArray();
}

async function findPublishedRecommended(limit = 12) {
    return getCollection()
        .find({
            type: 'product',
            status: 'published',
            isRecommended: true,
        })
        .sort({
            createdAt: -1,
        })
        .limit(limit)
        .toArray();
}

async function findByGroupId(productGroupId) {
    const objectId = toObjectId(productGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            productGroupId: objectId,
            type: 'product',
        })
        .sort({ createdAt: 1 })
        .toArray();
}

async function create(productData) {
    const document = createProductDocument(productData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

async function updateById(id, updateData) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
        {
            _id: objectId,
            type: 'product',
        },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );

    return result;
}

async function createMany(products) {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    const documents = products.map(createProductDocument);

    const result = await getCollection().insertMany(documents);

    return documents.map((document, index) => ({
        ...document,
        _id: result.insertedIds[index],
    }));
}

async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    const result = await getCollection().findOneAndDelete({
        _id: objectId,
        type: 'product',
    });

    return result;
}

module.exports = {
    findById,
    findBySlug,
    findPublishedBySlug,
    findPublishedByGroupId,
    findPublishedRecommended,
    findByGroupId,
    create,
    updateById,
    createMany,
    deleteById,
};