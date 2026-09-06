'use strict';

const { MongoClient } = require('mongodb');
const env = require('./env');

const client = new MongoClient(env.mongodb.uri);

let database = null;

async function connectDatabase() {
    if (database) {
        return database;
    }

    await client.connect();

    database = client.db(env.mongodb.database);

    await database.command({ ping: 1 });

    console.log('✅ MongoDB Atlas connected');

    return database;
}

function getDatabase() {
    if (!database) {
        throw new Error('MongoDB is not connected');
    }

    return database;
}

async function closeDatabase() {
    await client.close();
    database = null;
}

module.exports = {
    connectDatabase,
    getDatabase,
    closeDatabase,
};