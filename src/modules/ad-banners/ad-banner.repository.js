'use strict';

const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../config/database');
const { createAdBannerDocument } = require('./ad-banner.schema');

const COLLECTION = 'ad_banners';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

async function findAll() {
    return getCollection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

async function findPublished() {
    return getCollection()
        .find({
            status: 'published',
        })
        .sort({ createdAt: -1 })
        .toArray();
}

async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
    });
}

async function create(data) {
    const document = createAdBannerDocument(data);

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

    return getCollection().findOneAndUpdate(
        {
            _id: objectId,
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
}

async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: objectId,
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