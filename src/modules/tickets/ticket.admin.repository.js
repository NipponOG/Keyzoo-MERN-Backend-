'use strict';

const { ObjectId } = require('mongodb');

const { getDatabase } = require('../../config/database');

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

async function findAdminTickets({
    page = 1,
    pageSize = 20,
    search = '',
    status = '',
    priority = '',
    category = '',
} = {}) {
    const collection = getCollection();

    const currentPage = Math.max(
        Number(page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(Number(pageSize) || 20, 1),
        100
    );

    const skip = (currentPage - 1) * limit;

    const filter = {};

    // Search ticket number, order number, subject,
    // or customer user ID.
    if (search && search.trim()) {
        const searchValue = search.trim();

        filter.$or = [
            {
                ticketNumber: {
                    $regex: searchValue,
                    $options: 'i',
                },
            },
            {
                orderNumber: {
                    $regex: searchValue,
                    $options: 'i',
                },
            },
            {
                subject: {
                    $regex: searchValue,
                    $options: 'i',
                },
            },
            {
                userId: {
                    $regex: searchValue,
                    $options: 'i',
                },
            },
        ];
    }

    if (status) {
        filter.status = status;
    }

    if (priority) {
        filter.priority = priority;
    }

    if (category) {
        filter.category = category;
    }

    const [tickets, total] = await Promise.all([
        collection
            .find(filter)
            .sort({ updatedAt: -1 })
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
        tickets,
        total,
        page: currentPage,
        pageSize: limit,
        totalPages,
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

async function updateById(id, updateData) {
    const objectId = toObjectId(id);

    if (!objectId) {
        return null;
    }

    return getCollection().findOneAndUpdate(
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
}

module.exports = {
    findAdminTickets,
    findById,
    updateById,
};