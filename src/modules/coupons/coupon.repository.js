'use strict';

const { getDatabase } = require('../../config/database');
const { createCouponDocument } = require('./coupon.schema');

const COLLECTION = 'coupons';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findByCode(code) {
    if (
        typeof code !== 'string' ||
        !code.trim()
    ) {
        return null;
    }

    return getCollection().findOne({
        code: code.trim().toUpperCase(),
    });
}

async function findById(id) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOne({
        _id: new ObjectId(id),
    });
}

async function create(couponData) {
    const document =
        createCouponDocument({
            ...couponData,
            code:
                typeof couponData.code === 'string'
                    ? couponData.code.trim().toUpperCase()
                    : '',
        });

    const result =
        await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

async function updateById(id, update) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    const normalizedUpdate = {
        ...update,
        ...(typeof update.code === 'string'
            ? {
                code: update.code
                    .trim()
                    .toUpperCase(),
            }
            : {}),
        updatedAt: new Date(),
    };

    const result =
        await getCollection().findOneAndUpdate(
            {
                _id: new ObjectId(id),
            },
            {
                $set: normalizedUpdate,
            },
            {
                returnDocument: 'after',
            }
        );

    return result;
}

// async function incrementUsage(id) {
//     const { ObjectId } = require('mongodb');

//     if (!ObjectId.isValid(id)) {
//         return null;
//     }

//     return getCollection().findOneAndUpdate(
//         {
//             _id: new ObjectId(id),
//         },
//         {
//             $inc: {
//                 usageCount: 1,
//             },
//             $set: {
//                 updatedAt: new Date(),
//             },
//         },
//         {
//             returnDocument: 'after',
//         }
//     );
// }

async function incrementUsage(id, { session = null } = {}) {
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(id),

            $or: [
                {
                    usageLimit: null,
                },
                {
                    usageLimit: {
                        $exists: false,
                    },
                },
                {
                    $expr: {
                        $lt: [
                            {
                                $ifNull: [
                                    '$usageCount',
                                    0,
                                ],
                            },
                            '$usageLimit',
                        ],
                    },
                },
            ],
        },
        {
            $inc: {
                usageCount: 1,
            },
            $set: {
                updatedAt: new Date(),
            },
        },
        {
            ...(session
                ? {
                    session,
                }
                : {}),
            returnDocument: 'after',
        }
    );
}

async function ensureIndexes() {
    await getCollection().createIndex(
        {
            code: 1,
        },
        {
            unique: true,
        }
    );

    await getCollection().createIndex({
        isActive: 1,
        expiresAt: 1,
    });
}

module.exports = {
    findByCode,
    findById,
    create,
    updateById,
    incrementUsage,
    ensureIndexes,
};