'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');
const { createGiftCardDocument } = require('./gift-card.schema');

const COLLECTION = 'gift_cards';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

function toObjectId(id) {
    if (!id || !ObjectId.isValid(id)) {
        return null;
    }

    return new ObjectId(id);
}

async function findBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'gift-card',
    });
}

async function findPublishedBySlug(slug) {
    return getCollection().findOne({
        slug,
        type: 'gift-card',
        status: 'published',
    });
}

async function findById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOne({
        _id: objectId,
        type: 'gift-card',
    });
}

async function findByGroupId(giftCardGroupId) {
    const objectId = toObjectId(giftCardGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            giftCardGroupId: objectId,
            type: 'gift-card',
        })
        .sort({ createdAt: 1 })
        .toArray();
}

async function findPublishedByGroupId(giftCardGroupId) {
    const objectId = toObjectId(giftCardGroupId);

    if (!objectId) {
        return [];
    }

    return getCollection()
        .find({
            giftCardGroupId: objectId,
            type: 'gift-card',
            status: 'published',
        })
        .sort({ createdAt: 1 })
        .toArray();
}

async function create(giftCardData) {
    const document =
        createGiftCardDocument(giftCardData);

    const result =
        await getCollection().insertOne(document);

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

    const result = await getCollection().findOneAndUpdate(
        {
            _id: objectId,
            type: 'gift-card',
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

async function createMany(giftCards) {
    if (
        !Array.isArray(giftCards) ||
        giftCards.length === 0
    ) {
        return [];
    }

    const documents =
        giftCards.map(createGiftCardDocument);

    const result =
        await getCollection().insertMany(documents);

    return documents.map((document, index) => ({
        ...document,
        _id: result.insertedIds[index],
    }));
}

async function findPublishedRecommended(limit = 12) {
    return getCollection()
        .find({
            type: 'gift-card',
            status: 'published',
            isRecommended: true,
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

async function findPublishedBestSelling(limit = 30) {
    return getCollection()
        .find({
            type: 'gift-card',
            status: 'published',
            isBestSeller: true,
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

async function findPublishedCatalog() {
    return getCollection()
        .find(
            {
                type: 'gift-card',
                status: 'published',
            },
            {
                projection: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                },
            }
        )
        .sort({
            title: 1,
        })
        .toArray();
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildStoreGiftCardFilter({ platform, region }) {
    const filter = {
        type: 'gift-card',
        status: 'published',
    };

    if (platform) {
        filter.platform = {
            $regex: `^${escapeRegex(platform)}$`,
            $options: 'i',
        };
    }

    if (region) {
        const regionRegex = {
            $regex: `^${escapeRegex(region)}$`,
            $options: 'i',
        };

        filter.$or = [
            {
                card_region: regionRegex,
            },
            {
                $and: [
                    {
                        $or: [
                            { card_region: null },
                            { card_region: '' },
                            { card_region: { $exists: false } },
                        ],
                    },
                    {
                        region: regionRegex,
                    },
                ],
            },
        ];
    }

    return filter;
}

async function findPublishedStoreGiftCards({
    platform,
    region,
    skip = 0,
    limit = 24,
}) {
    const filter = buildStoreGiftCardFilter({
        platform,
        region,
    });

    return getCollection()
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
}

async function countPublishedStoreGiftCards({
    platform,
    region,
}) {
    const filter = buildStoreGiftCardFilter({
        platform,
        region,
    });

    return getCollection().countDocuments(filter);
}

async function findPublishedStoreGiftCardRegions({ platform }) {
    const filter = {
        type: 'gift-card',
        status: 'published',
    };

    if (platform) {
        filter.platform = {
            $regex: `^${escapeRegex(platform)}$`,
            $options: 'i',
        };
    }

    return getCollection().aggregate([
        {
            $match: filter,
        },
        {
            $project: {
                effectiveRegion: {
                    $cond: [
                        {
                            $and: [
                                { $ne: [{ $ifNull: ['$card_region', ''] }, ''] },
                            ],
                        },
                        '$card_region',
                        '$region',
                    ],
                },
            },
        },
        {
            $match: {
                effectiveRegion: {
                    $type: 'string',
                    $ne: '',
                },
            },
        },
        {
            $group: {
                _id: {
                    $toLower: {
                        $trim: {
                            input: '$effectiveRegion',
                        },
                    },
                },
                label: {
                    $first: {
                        $trim: {
                            input: '$effectiveRegion',
                        },
                    },
                },
            },
        },
        {
            $sort: {
                label: 1,
            },
        },
        {
            $project: {
                _id: 0,
                value: '$_id',
                label: 1,
            },
        },
    ]).toArray();
}

// Delete a gift card by MongoDB _id
async function deleteById(id) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndDelete({
        _id: objectId,
        type: 'gift-card',
    });
}

module.exports = {
    findBySlug,
    findPublishedBySlug,
    findById,
    findPublishedByGroupId,
    findByGroupId,
    findPublishedRecommended,
    findPublishedBestSelling,
    findPublishedCatalog,
    create,
    updateById,
    createMany,
    deleteById,
    findPublishedStoreGiftCards,
    countPublishedStoreGiftCards,
    findPublishedStoreGiftCardRegions,
};