'use strict';

const repository = require('./game-key.repository');

async function getGameKeyByLegacyId(legacyId) {
    if (!legacyId) {
        const error = new Error('Game Key legacy ID is required');
        error.statusCode = 400;
        throw error;
    }

    const gameKey = await repository.findByLegacyId(legacyId);

    if (!gameKey) {
        const error = new Error('Game Key not found');
        error.statusCode = 404;
        throw error;
    }

    return gameKey;
}

async function getGameKeysByOwner(ownerType, ownerId) {
    if (!ownerType) {
        const error = new Error('Game Key owner type is required');
        error.statusCode = 400;
        throw error;
    }

    if (!ownerId) {
        const error = new Error('Game Key owner ID is required');
        error.statusCode = 400;
        throw error;
    }

    const allowedOwnerTypes = ['product', 'gift-card'];

    if (!allowedOwnerTypes.includes(ownerType)) {
        const error = new Error('Invalid Game Key owner type');
        error.statusCode = 400;
        throw error;
    }

    return repository.findByOwner(ownerType, ownerId);
}

async function assignAvailableGameKey(ownerType, ownerId) {
    if (!ownerType) {
        const error = new Error('Game Key owner type is required');
        error.statusCode = 400;
        throw error;
    }

    if (!ownerId) {
        const error = new Error('Game Key owner ID is required');
        error.statusCode = 400;
        throw error;
    }

    const allowedOwnerTypes = ['product', 'gift-card'];

    if (!allowedOwnerTypes.includes(ownerType)) {
        const error = new Error('Invalid Game Key owner type');
        error.statusCode = 400;
        throw error;
    }

    const gameKey = await repository.assignAvailableKey(
        ownerType,
        ownerId
    );

    if (!gameKey) {
        const error = new Error('No available Game Key found');
        error.statusCode = 404;
        throw error;
    }

    return gameKey;
}

async function uploadGameKeys({ ownerType, ownerId, keys }) {
    if (!ownerType) {
        const error = new Error('Game Key owner type is required');
        error.statusCode = 400;
        throw error;
    }

    if (!ownerId) {
        const error = new Error('Game Key owner ID is required');
        error.statusCode = 400;
        throw error;
    }

    const allowedOwnerTypes = ['product', 'gift-card'];

    if (!allowedOwnerTypes.includes(ownerType)) {
        const error = new Error('Invalid Game Key owner type');
        error.statusCode = 400;
        throw error;
    }

    if (!Array.isArray(keys) || keys.length === 0) {
        const error = new Error('At least one Game Key is required');
        error.statusCode = 400;
        throw error;
    }

    const cleanedKeys = keys
        .map((key) => String(key).trim())
        .filter(Boolean);

    if (cleanedKeys.length === 0) {
        const error = new Error('At least one valid Game Key is required');
        error.statusCode = 400;
        throw error;
    }

    const uniqueKeys = [...new Set(cleanedKeys)];

    const existingKeys = await Promise.all(
        uniqueKeys.map((code) => repository.findByCode(code))
    );

    const duplicateKeys = [];

    existingKeys.forEach((existingKey, index) => {
        if (existingKey) {
            duplicateKeys.push(uniqueKeys[index]);
        }
    });

    if (duplicateKeys.length > 0) {
        const error = new Error(
            `These Game Keys already exist: ${duplicateKeys.join(', ')}`
        );
        error.statusCode = 409;
        throw error;
    }

    const now = new Date();

    const gameKeyDocuments = uniqueKeys.map((code) => ({
        code,
        ownerType,
        ownerId: Number(ownerId),
        isAvailable: true,
        uploadedAt: now,
        assignedAt: null,
        soldAt: null,
        batchId: null,
        notes: null,
        legacyId: null,
        legacyDocumentId: null,
        legacyCreatedAt: null,
        legacyUpdatedAt: null,
        migratedAt: null,
        createdAt: now,
        updatedAt: now,
    }));

    return repository.createMany(gameKeyDocuments);
}

async function deleteGameKey(id) {
    if (!id) {
        const error = new Error('Game Key ID is required');
        error.statusCode = 400;
        throw error;
    }

    const gameKey = await repository.deleteById(id);

    if (!gameKey) {
        const error = new Error('Game Key not found');
        error.statusCode = 404;
        throw error;
    }

    return gameKey;
}

module.exports = {
    getGameKeyByLegacyId,
    getGameKeysByOwner,
    assignAvailableGameKey,
    deleteGameKey,
    uploadGameKeys,
};