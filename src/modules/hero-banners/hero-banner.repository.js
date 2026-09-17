'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const {
    createHeroBannerDocument,
} = require('./hero-banner.schema');

const COLLECTION = 'hero_banners';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}


// Get all banners
async function findAll() {
    return getCollection()
        .find({
            type: 'hero-banner',
        })
        .sort({
            sortOrder: 1,
            createdAt: -1,
        })
        .toArray();
}


// Get published banners for storefront
async function findPublished() {
    return getCollection()
        .find({
            type: 'hero-banner',
            status: 'published',
        })
        .sort({
            sortOrder: 1,
            createdAt: -1,
        })
        .toArray();
}


// Get one banner
async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
        type: 'hero-banner',
    });
}


// Create banner
async function create(data) {
    const document = createHeroBannerDocument(data);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}


// Update banner
async function updateById(id, updateData) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
        {
            _id: objectId,
            type: 'hero-banner',
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


// Delete banner
async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: objectId,
        type: 'hero-banner',
    });
}

module.exports = {
    findAll,
    findPublished,
    findById,
    create,
    updateById,
    deleteById,
};