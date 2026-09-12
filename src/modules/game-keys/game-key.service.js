'use strict';

const { ObjectId } = require('mongodb');
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
    productId = null,
    giftCardId = null,
}) {
    if (productId && giftCardId) {
        const error = new Error(
            'Provide either productId or giftCardId, not both.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!productId && !giftCardId) {
        const error = new Error(
            'Either productId or giftCardId is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (productId) {
        validateMongoId(productId, 'product ID');

        return repository.assignAvailableProductKey(
            productId
        );
    }

    validateMongoId(giftCardId, 'gift card ID');

    return repository.assignAvailableGiftCardKey(
        giftCardId
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

// Update a game key
async function updateGameKey(id, code) {
    validateMongoId(id, 'game key ID');

    if (!code || typeof code !== 'string') {
        const error = new Error(
            'Game key is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    const cleanedCode = code.trim();

    if (!cleanedCode) {
        const error = new Error(
            'Game key cannot be empty.'
        );

        error.statusCode = 400;
        throw error;
    }

    // Find the current key
    const existingKey =
        await repository.findById(id);

    if (!existingKey) {
        const error = new Error(
            'Game key not found.'
        );

        error.statusCode = 404;
        throw error;
    }

    // Do not allow editing a sold key
    if (!existingKey.isAvailable) {
        const error = new Error(
            'Sold game keys cannot be edited.'
        );

        error.statusCode = 409;
        throw error;
    }

    // Check whether another key already uses this code
    const duplicateKey =
        await repository.findByCode(cleanedCode);

    if (
        duplicateKey &&
        duplicateKey._id.toString() !== id
    ) {
        const error = new Error(
            'A game key with this code already exists.'
        );

        error.statusCode = 409;
        throw error;
    }

    return repository.updateCodeById(
        id,
        cleanedCode
    );
}

// Delete a game key
async function deleteGameKey(id) {
    validateMongoId(id, 'game key ID');

    return repository.deleteById(id);
}

// Upload multiple game keys
async function uploadGameKeys({
    productId = null,
    giftCardId = null,
    keys,
}) {
    if (productId && giftCardId) {
        const error = new Error(
            'A game key cannot belong to both a product and a gift card.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!productId && !giftCardId) {
        const error = new Error(
            'Either productId or giftCardId is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (productId) {
        validateMongoId(productId, 'product ID');
    }

    if (giftCardId) {
        validateMongoId(giftCardId, 'gift card ID');
    }

    if (!Array.isArray(keys) || keys.length === 0) {
        const error = new Error(
            'At least one game key is required.'
        );

        error.statusCode = 400;
        throw error;
    }

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

    // Check existing codes
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

    const productObjectId = productId
        ? new ObjectId(productId)
        : null;

    const giftCardObjectId = giftCardId
        ? new ObjectId(giftCardId)
        : null;

    const gameKeyDocuments = cleanedKeys.map(
        (code) => ({
            code,

            productId: productObjectId,

            giftCardId: giftCardObjectId,

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
    
    updateGameKey,
};