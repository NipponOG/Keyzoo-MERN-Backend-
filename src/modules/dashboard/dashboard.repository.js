'use strict';

const { getDatabase } = require('../../config/database');

const COLLECTION = 'orders';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function getRevenueChart() {
    return getCollection().aggregate([
        {
            $match: {
                paymentStatus: 'paid',
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                revenue: {
                    $sum: '$totalAmount',
                },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
            },
        },
    ]).toArray();
}

async function getOrderChart() {
    return getCollection().aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                orders: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
            },
        },
    ]).toArray();
}

async function getRefundsChart() {
    return getCollection().aggregate([
        {
            $match: {
                paymentStatus: 'refunded',
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                refunds: {
                    $sum: '$totalAmount',
                },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
            },
        },
    ]).toArray();
}

async function getCategorySales() {
    return getCollection().aggregate([
        {
            $match: {
                paymentStatus: 'paid',
            },
        },
        {
            $unwind: '$cartSnapshot',
        },
        {
            $group: {
                _id: '$cartSnapshot.type',
                value: {
                    $sum: {
                        $multiply: [
                            {
                                $ifNull: [
                                    '$cartSnapshot.price',
                                    0,
                                ],
                            },
                            {
                                $ifNull: [
                                    '$cartSnapshot.quantity',
                                    1,
                                ],
                            },
                        ],
                    },
                },
            },
        },
        {
            $sort: {
                value: -1,
            },
        },
    ]).toArray();
}

module.exports = {
    getRevenueChart,
    getOrderChart,
    getRefundsChart,
    getCategorySales,
};