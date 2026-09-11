'use strict';

const repository = require('./game-key.repository');

const VALID_OWNER_TYPES = [
    'product',
    'gift-card',
];

function validateOwnerType(ownerType) {
    if (!VALID_OWNER_TYPES.includes(ownerType)) {
        const error = new Error(
            'Invalid owner type. Expected product or gift-card.'
        );

        error.statusCode = 400;
        throw error;
    }
}

function validateMongoId(id, fieldName = 'ID') {
    if (!id || !/^[a-fA-F0-9]{24}$/.test(String(id))) {
        const error = new Error(
            `Invalid ${fieldName}.`
        );

        error.statusCode = 400;
        throw error;
    }
}

// Get one game key by MongoDB _id
async function getGameKeyById(id) {
    validateMongoId(id, 'game key ID');

    return repository.findById(id);
}

// Assign an available key
async function assignAvailableGameKey({
    ownerType,
    ownerId,
}) {
    validateOwnerType(ownerType);
    validateMongoId(ownerId, 'owner ID');

    if (ownerType === 'product') {
        return repository.assignAvailableProductKey(
            ownerId
        );
    }

    return repository.assignAvailableGiftCardKey(
        ownerId
    );
}

// Get all keys belonging to a product
async function getGameKeysByProductId(productId) {
    validateMongoId(productId, 'product ID');

    return repository.findByProductId(productId);
}

// Get all keys belonging to a gift card
async function getGameKeysByGiftCardId(giftCardId) {
    validateMongoId(giftCardId, 'gift card ID');

    return repository.findByGiftCardId(giftCardId);
}

// Delete a game key
async function deleteGameKey(id) {
    validateMongoId(id, 'game key ID');

    return repository.deleteById(id);
}

// Upload multiple game keys
async function uploadGameKeys({
    ownerType,
    ownerId,
    keys,
}) {
    validateOwnerType(ownerType);
    validateMongoId(ownerId, 'owner ID');

    if (!Array.isArray(keys) || keys.length === 0) {
        const error = new Error(
            'At least one game key is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    // Clean incoming keys
    const cleanedKeys = [
        ...new Set(
            keys
                .map((key) => String(key).trim())
                .filter(Boolean)
        ),
    ];

    if (cleanedKeys.length === 0) {
        const error = new Error(
            'No valid game keys were provided.'
        );

        error.statusCode = 400;
        throw error;
    }

    // Check whether any codes already exist
    const existingKeys = [];

    for (const code of cleanedKeys) {
        const existing =
            await repository.findByCode(code);

        if (existing) {
            existingKeys.push(code);
        }
    }

    if (existingKeys.length > 0) {
        const error = new Error(
            `These game keys already exist: ${existingKeys.join(', ')}`
        );

        error.statusCode = 409;
        throw error;
    }

    const now = new Date();

    const gameKeyDocuments = cleanedKeys.map(
        (code) => ({
            code,

            productId:
                ownerType === 'product'
                    ? ownerId
                    : null,

            giftCardId:
                ownerType === 'gift-card'
                    ? ownerId
                    : null,

            isAvailable: true,

            uploadedAt: now,
            assignedAt: null,
            soldAt: null,

            batchId: null,
            notes: null,

            createdAt: now,
            updatedAt: now,
        })
    );

    return repository.createMany(
        gameKeyDocuments
    );
}

module.exports = {
    getGameKeyById,
    assignAvailableGameKey,

    getGameKeysByProductId,
    getGameKeysByGiftCardId,

    deleteGameKey,
    uploadGameKeys,
};