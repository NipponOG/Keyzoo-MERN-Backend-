'use strict';

const giftCardService =
    require('./gift-card.service');

async function getGiftCardBySlug(
    req,
    res,
    next
) {
    try {
        const giftCard =
            await giftCardService.getGiftCardBySlug(
                req.params.slug
            );

        res.json({
            success: true,
            data: giftCard,
        });
    } catch (error) {
        next(error);
    }
}

async function getGiftCardById(
    req,
    res,
    next
) {
    try {
        const giftCard =
            await giftCardService.getGiftCardById(
                req.params.id
            );

        res.json({
            success: true,
            data: giftCard,
        });
    } catch (error) {
        next(error);
    }
}

async function getGiftCardVariations(req, res, next) {
    try {
        const giftCards =
            await giftCardService.getGiftCardVariations(
                req.params.giftCardGroupId
            );

        res.json({
            success: true,
            data: giftCards,
        });
    } catch (error) {
        next(error);
    }
}

async function getPublishedGiftCardVariations(
    req,
    res,
    next
) {
    try {
        const giftCards =
            await giftCardService.getPublishedGiftCardVariations(
                req.params.giftCardGroupId
            );

        res.json({
            success: true,
            data: giftCards,
        });
    } catch (error) {
        next(error);
    }
}

async function createGiftCard(
    req,
    res,
    next
) {
    try {
        const giftCard =
            await giftCardService.createGiftCard(
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                'Gift Card created successfully',
            data: giftCard,
        });
    } catch (error) {
        next(error);
    }
}

async function createGiftCardWithVariations(
    req,
    res,
    next
) {
    try {
        const result =
            await giftCardService
                .createGiftCardWithVariations(
                    req.body
                );

        res.status(201).json({
            success: true,
            message:
                'Gift Card variations created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function getPublishedRecommendedGiftCards(req, res, next) {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 12, 1),
            50
        );

        const giftCards =
            await giftCardService.getPublishedRecommendedGiftCards(limit);

        return res.json({
            success: true,
            data: giftCards,
        });
    } catch (error) {
        next(error);
    }
}

async function getPublishedBestSellingGiftCards(req, res, next) {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 30, 1),
            50
        );

        const giftCards =
            await giftCardService.getPublishedBestSellingGiftCards(limit);

        return res.json({
            success: true,
            data: giftCards,
        });
    } catch (error) {
        next(error);
    }
}

async function updateGiftCard(req, res, next) {
    try {
        const { id } = req.params;

        const updatedGiftCard =
            await giftCardService.updateGiftCard(
                id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: 'Gift card updated successfully.',
            data: updatedGiftCard,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteGiftCard(req, res, next) {
    try {
        const { id } = req.params;

        const result =
            await giftCardService.deleteGiftCard(id);

        return res.status(200).json({
            success: true,
            message: 'Gift card deleted successfully.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getGiftCardBySlug,
    getGiftCardById,
    getGiftCardVariations,
    getPublishedRecommendedGiftCards,
    getPublishedBestSellingGiftCards,
    createGiftCard,
    createGiftCardWithVariations,
    updateGiftCard,
    deleteGiftCard,
    getPublishedGiftCardVariations,
};