'use strict';

const { ObjectId } = require('mongodb');
const { getDb } = require('../../config/database');

const COLLECTION_NAME = 'game_banners';

function getCollection() {
    return getDb().collection(COLLECTION_NAME);
}

async function findAll() {
    return getCollection()
        .find({})
        .sort({
            sortOrder: 1,
            createdAt: -1,
        })
        .toArray();
}

async function findPublished() {
    return getCollection()
        .find({
            status: 'published',
        })
        .sort({
            sortOrder: 1,
            createdAt: -1,
        })
        .toArray();
}

async function findById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOne({
        _id: new ObjectId(id),
    });
}

async function create(document) {
    const result = await getCollection().insertOne(document);

    return getCollection().findOne({
        _id: result.insertedId,
    });
}

async function updateById(id, updates) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(id),
        },
        {
            $set: {
                ...updates,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );

    return result;
}

async function deleteById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().deleteOne({
        _id: new ObjectId(id),
    });
}

module.exports = {
    COLLECTION_NAME,
    findAll,
    findPublished,
    findById,
    create,
    updateById,
    deleteById,
};