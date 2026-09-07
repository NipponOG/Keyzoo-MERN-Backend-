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

module.exports = {
    getGameKeyByLegacyId,
    assignAvailableGameKey,
};