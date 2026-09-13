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

async function getGiftCardVariations(
    req,
    res,
    next
) {
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

module.exports = {
    getGiftCardBySlug,
    getGiftCardById,
    getGiftCardVariations,
    createGiftCard,
    createGiftCardWithVariations,
};