'use strict';

const { getDatabase } = require('../../config/database');
const { createUserDocument } = require('./auth.schema');
const { ObjectId } = require('mongodb');

const COLLECTION = 'users';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findByEmail(email) {
    return getCollection().findOne({
        email: email.toLowerCase(),
    });
}

async function findByGoogleId(googleId) {
    return getCollection().findOne({
        googleId,
    });
}

async function findByProviderId(provider, providerId) {
    return getCollection().findOne({
        provider,
        googleId: providerId,
    });
}

async function findById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOne({
        _id: new ObjectId(id),
    });
}

async function create(userData) {
    const document = createUserDocument(userData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

async function ensureIndexes() {
    await getCollection().createIndex(
        { email: 1 },
        { unique: true }
    );

    await getCollection().createIndex(
        { googleId: 1 },
        {
            unique: true,
            sparse: true,
        }
    );
}

module.exports = {
    findByEmail,
    findById,
    create,
    ensureIndexes,
    findByGoogleId,
    findByProviderId,
};