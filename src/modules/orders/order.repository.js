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

async function updateByOrderNumber(
    orderNumber,
    update
) {
    if (!orderNumber) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            orderNumber,
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

async function findUserOrders({
    userId,
    page = 1,
    pageSize = 10,
} = {}) {
    if (!userId) {
        return {
            orders: [],
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 1,
        };
    }

    const collection = getCollection();

    const currentPage = Math.max(
        Number(page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(Number(pageSize) || 10, 1),
        50
    );

    const skip =
        (currentPage - 1) * limit;

    const filter = {
        userId: userId.toString(),
    };

    const [orders, total] =
        await Promise.all([
            collection
                .find(filter)
                .sort({
                    createdAt: -1,
                })
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

async function claimOrderForFulfillment(
    orderNumber
) {
    if (!orderNumber) {
        return null;
    }

    const now = new Date();

    /*
     * If an order has been processing for longer than
     * this amount of time, consider the previous
     * fulfillment attempt abandoned and allow recovery.
     */
    const staleProcessingThreshold =
        new Date(
            now.getTime() -
            10 * 60 * 1000
        );

    return getCollection().findOneAndUpdate(
        {
            orderNumber,

            paymentStatus: 'paid',

            gameKeysAssigned: {
                $ne: true,
            },

            $or: [
                {
                    deliveryStatus: {
                        $ne: 'processing',
                    },
                },

                {
                    deliveryStatus:
                        'processing',

                    updatedAt: {
                        $lt:
                            staleProcessingThreshold,
                    },
                },
            ],
        },
        {
            $set: {
                deliveryStatus:
                    'processing',

                updatedAt: now,
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function updateFulfillmentState(
    orderNumber,
    {
        assignedKeys,
        totalKeysAssigned,
        gameKeysAssigned,
        deliveryStatus,
        manualDeliveryRequired,
        notes,
    },
    session = null
) {
    if (!orderNumber) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            orderNumber,
        },
        {
            $set: {
                assignedKeys,
                totalKeysAssigned,
                gameKeysAssigned,
                deliveryStatus,
                manualDeliveryRequired,
                notes,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
            ...(session ? { session } : {}),
        }
    );
}

module.exports = {
    findById,
    findByOrderNumber,
    findByStripeSessionId,
    findByCashfreeOrderId,

    updateByOrderNumber,
    claimOrderForFulfillment,
    updateFulfillmentState,

    findAdminOrders,
    findUserOrders,
    create,
    updateById,
    deleteById,
    ensureIndexes,
};