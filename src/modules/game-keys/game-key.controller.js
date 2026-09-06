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

module.exports = {
    getGameKeyByLegacyId,
};