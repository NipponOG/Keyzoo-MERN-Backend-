'use strict';

const { getDatabase } = require('../../config/database');
const {
    createNewsletterSubscriberDocument,
} = require('./newsletter.schema');

const COLLECTION = 'newsletter_subscribers';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findByEmail(email) {
    return getCollection().findOne({
        email: email.toLowerCase(),
    });
}

async function create(data) {
    const document =
        createNewsletterSubscriberDocument(data);

    const result =
        await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

module.exports = {
    findByEmail,
    create,
};