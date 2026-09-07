'use strict';

const gameKeyService = require('./game-key.service');

async function getGameKeyByLegacyId(req, res, next) {
    try {
        const gameKey = await gameKeyService.getGameKeyByLegacyId(
            req.params.legacyId
        );

        res.json({
            success: true,
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

async function assignAvailableGameKey(req, res, next) {
    try {
        const gameKey = await gameKeyService.assignAvailableGameKey(
            req.params.ownerType,
            req.params.ownerId
        );

        res.json({
            success: true,
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGameKeyByLegacyId,
    assignAvailableGameKey,
};