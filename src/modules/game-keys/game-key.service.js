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

module.exports = {
    getGameKeyByLegacyId,
};