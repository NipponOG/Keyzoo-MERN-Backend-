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

async function getGameKeysByOwner(req, res, next) {
    try {
        const keys = await gameKeyService.getGameKeysByOwner(
            req.query.ownerType,
            req.query.ownerId
        );

        res.json({
            success: true,
            data: keys,
        });
    } catch (error) {
        next(error);
    }
}

async function uploadGameKeys(req, res, next) {
    try {
        const { ownerType, ownerId, keys } = req.body;

        const gameKeys = await gameKeyService.uploadGameKeys({
            ownerType,
            ownerId,
            keys,
        });

        res.status(201).json({
            success: true,
            message: `${gameKeys.length} Game Key(s) uploaded successfully`,
            data: gameKeys,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteGameKey(req, res, next) {
    try {
        const gameKey = await gameKeyService.deleteGameKey(
            req.params.id
        );

        res.json({
            success: true,
            message: 'Game Key deleted successfully',
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGameKeyByLegacyId,
    assignAvailableGameKey,
    getGameKeysByOwner,
    deleteGameKey,
    uploadGameKeys,
};