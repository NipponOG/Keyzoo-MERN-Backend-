'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const { createTicketDocument } = require('./ticket.schema');

const COLLECTION = 'tickets';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

async function create(ticketData) {
    const document = createTicketDocument(ticketData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
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

async function findByTicketNumber(ticketNumber) {
    return getCollection().findOne({
        ticketNumber,
    });
}

async function findByUserId(userId, { page = 1, pageSize = 20 } = {}) {
    if (!userId) {
        return {
            tickets: [],
            total: 0,
            page: 1,
            pageSize: 20,
            totalPages: 0,
        };
    }

    const safePage = Math.max(
        Number(page) || 1,
        1
    );

    const safePageSize = Math.min(
        Math.max(Number(pageSize) || 20, 1),
        50
    );

    const skip =
        (safePage - 1) * safePageSize;

    const filter = {
        userId: userId.toString(),
    };

    const [
        tickets,
        total,
    ] = await Promise.all([
        getCollection()
            .find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(safePageSize)
            .toArray(),

        getCollection().countDocuments(filter),
    ]);

    return {
        tickets,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil(
            total / safePageSize
        ),
    };
}

async function findByOrderId(orderId) {
    const objectId = toObjectId(orderId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            orderId: objectId,
        })
        .sort({ createdAt: -1 })
        .toArray();
}

async function updateById(id, updateData) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
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

    return result;
}

async function ensureIndexes() {
    await getCollection().createIndex(
        { ticketNumber: 1 },
        { unique: true }
    );

    await getCollection().createIndex({
        userId: 1,
        updatedAt: -1,
    });

    await getCollection().createIndex({
        orderId: 1,
        createdAt: -1,
    });

    await getCollection().createIndex({
        status: 1,
        priority: 1,
        updatedAt: -1,
    });

    await getCollection().createIndex({
        'item.productId': 1,
    });
}

module.exports = {
    create,
    findById,
    findByTicketNumber,
    findByUserId,
    findByOrderId,
    updateById,
    ensureIndexes,
};