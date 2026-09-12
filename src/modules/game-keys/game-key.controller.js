'use strict';

const service = require('./game-key.service');

async function getGameKeysByOwner(req, res, next) {
    try {
        const { productId, giftCardId } = req.query;

        if (!productId && !giftCardId) {
            const error = new Error(
                'Either productId or giftCardId is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (productId && giftCardId) {
            const error = new Error(
                'Provide either productId or giftCardId, not both.'
            );

            error.statusCode = 400;
            throw error;
        }

        const keys = productId
            ? await service.getGameKeysByProductId(productId)
            : await service.getGameKeysByGiftCardId(giftCardId);

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
        const {
            productId = null,
            giftCardId = null,
            keys,
        } = req.body;

        if (!productId && !giftCardId) {
            const error = new Error(
                'Either productId or giftCardId is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (productId && giftCardId) {
            const error = new Error(
                'Provide either productId or giftCardId, not both.'
            );

            error.statusCode = 400;
            throw error;
        }

        const gameKeys = await service.uploadGameKeys({
            productId,
            giftCardId,
            keys,
        });

        res.status(201).json({
            success: true,
            message: `${gameKeys.length} Game Key(s) uploaded successfully`,
            uploaded: gameKeys.length,
            duplicates: 0,
            data: gameKeys,
        });
    } catch (error) {
        next(error);
    }
}

async function updateGameKey(req, res, next) {
    try {
        const { id } = req.params;
        const { code } = req.body;

        const gameKey =
            await service.updateGameKey(
                id,
                code
            );

        res.json({
            success: true,
            message: 'Game Key updated successfully',
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteGameKey(req, res, next) {
    try {
        const { id } = req.params;

        const gameKey =
            await service.deleteGameKey(id);

        if (!gameKey) {
            const error = new Error(
                'Game key not found.'
            );

            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            message: 'Game Key deleted successfully',
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

async function assignAvailableGameKey(req, res, next) {
    try {
        const {
            productId,
            giftCardId,
        } = req.body;

        if (!productId && !giftCardId) {
            const error = new Error(
                'Either productId or giftCardId is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (productId && giftCardId) {
            const error = new Error(
                'Provide either productId or giftCardId, not both.'
            );

            error.statusCode = 400;
            throw error;
        }

        const gameKey =
            await service.assignAvailableGameKey({
                productId,
                giftCardId,
            });

        if (!gameKey) {
            const error = new Error(
                'No available game key found.'
            );

            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            data: gameKey,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGameKeysByOwner,
    uploadGameKeys,
    deleteGameKey,
    updateGameKey,
    assignAvailableGameKey,
};