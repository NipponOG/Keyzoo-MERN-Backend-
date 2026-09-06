'use strict';

const giftCardService = require('./gift-card.service');

async function getGiftCardBySlug(req, res, next) {
    try {
        const giftCard = await giftCardService.getGiftCardBySlug(
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

module.exports = {
    getGiftCardBySlug,
};