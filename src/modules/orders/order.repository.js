'use strict';

const { getDatabase } = require('../../config/database');
const { createOrderDocument } = require('./order.schema');

const COLLECTION = 'orders';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

/**
 * Find one order by MongoDB ID.
 */
async function findById(id) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOne({
        _id: new ObjectId(id),
    });
}

/**
 * Find one order by order number.
 */
async function findByOrderNumber(orderNumber) {
    return getCollection().findOne({
        orderNumber,
    });
}

/**
 * Find one order by Stripe session ID.
 */
async function findByStripeSessionId(stripeSessionId) {
    return getCollection().findOne({
        stripeSessionId,
    });
}

/**
 * Find one order by Cashfree order ID.
 */
async function findByCashfreeOrderId(cashfreeOrderId) {
    return getCollection().findOne({
        cashfreeOrderId,
    });
}

/**
 * Find paginated orders for the admin dashboard.
 *
 * Supported filters:
 * - page
 * - pageSize
 * - search
 * - status
 */
async function findAdminOrders({
    page = 1,
    pageSize = 10,
    search = '',
    status = '',
} = {}) {
    const collection = getCollection();

    const currentPage = Math.max(
        Number(page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(Number(pageSize) || 10, 1),
        100
    );

    const skip = (currentPage - 1) * limit;

    const filter = {};

    /*
     * Search by order number.
     */
    if (search && search.trim()) {
        filter.orderNumber = {
            $regex: search.trim(),
            $options: 'i',
        };
    }

    /*
     * Status filter.
     *
     * "manual" is not an actual deliveryStatus.
     * It represents orders where manualDeliveryRequired === true.
     */
    if (status === 'manual') {
        filter.manualDeliveryRequired = true;
    } else if (status) {
        filter.deliveryStatus = status;
    }

    const [orders, total] = await Promise.all([
        collection
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),

        collection.countDocuments(filter),
    ]);

    const totalPages = Math.max(
        Math.ceil(total / limit),
        1
    );

    return {
        orders,
        total,
        page: currentPage,
        pageSize: limit,
        totalPages,
    };
}

/**
 * Create a new order.
 */
async function create(orderData) {
    const document = createOrderDocument(orderData);

    const result = await getCollection().insertOne(
        document
    );

    return {
        ...document,
        _id: result.insertedId,
    };
}

/**
 * Update an order.
 */
async function updateById(id, update) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    const result = await getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(id),
        },
        {
            $set: {
                ...update,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );

    return result;
}

/**
 * Delete an order.
 */
async function deleteById(id) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().deleteOne({
        _id: new ObjectId(id),
    });
}

/**
 * Create indexes used by the order system.
 */
async function ensureIndexes() {
    const collection = getCollection();

    await collection.createIndex(
        { orderNumber: 1 },
        { unique: true }
    );

    // await collection.createIndex(
    //     { cashfreeOrderId: 1 },
    //     {
    //         unique: true,
    //         sparse: true,
    //     }
    // );

    await collection.createIndex({
        stripeSessionId: 1,
    });

    await collection.createIndex({
        stripePaymentIntentId: 1,
    });

    await collection.createIndex({
        deliveryEmail: 1,
    });

    await collection.createIndex({
        paymentStatus: 1,
        createdAt: -1,
    });

    await collection.createIndex({
        deliveryStatus: 1,
        createdAt: -1,
    });

    await collection.createIndex({
        manualDeliveryRequired: 1,
        createdAt: -1,
    });

    await collection.createIndex({
        userId: 1,
        createdAt: -1,
    });

    await collection.createIndex({
        createdAt: -1,
    });
}

module.exports = {
    findById,
    findByOrderNumber,
    findByStripeSessionId,
    findByCashfreeOrderId,
    findAdminOrders,
    create,
    updateById,
    deleteById,
    ensureIndexes,
};