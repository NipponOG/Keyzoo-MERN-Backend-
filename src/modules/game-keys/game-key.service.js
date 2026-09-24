'use strict';

const { ObjectId } = require('mongodb');
const repository = require('./game-key.repository');

const productRepository = require('../products/product.repository');
const giftCardRepository = require('../gift-cards/gift-card.repository');

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

    const existingKey =
        await repository.findById(id);

    if (!existingKey) {
        const error = new Error(
            'Game key not found.'
        );

        error.statusCode = 404;
        throw error;
    }

    // Do not allow assigned or sold keys to be deleted
    if (!existingKey.isAvailable) {
        const error = new Error(
            'Sold or assigned game keys cannot be deleted.'
        );

        error.statusCode = 409;
        throw error;
    }

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

    // Verify that the owner actually exists
    if (productId) {
        const product =
            await productRepository.findById(productId);

        if (!product) {
            const error = new Error(
                'Product not found.'
            );

            error.statusCode = 404;
            throw error;
        }
    }

    if (giftCardId) {
        const giftCard =
            await giftCardRepository.findById(giftCardId);

        if (!giftCard) {
            const error = new Error(
                'Gift card not found.'
            );

            error.statusCode = 404;
            throw error;
        }
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

    // Check existing codes in one database query
    const existingKeys = await repository.findByCodes(cleanedKeys);

    if (existingKeys.length > 0) {

        const existingCodes = existingKeys.map((key) => key.code);

        const error = new Error(
            `These game keys already exist: ${existingCodes.join(', ')}`
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

async function bulkDeleteGameKeys(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('No game keys selected for deletion.');
    }

    return repository.bulkDeleteByIds(ids);
}

module.exports = {
    getGameKeyById,
    assignAvailableGameKey,

    getGameKeysByProductId,
    getGameKeysByGiftCardId,

    deleteGameKey,
    uploadGameKeys,

    updateGameKey,
    bulkDeleteGameKeys,
};