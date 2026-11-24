'use strict';

const service = require('./wishlist.service');

async function getWishlist(req, res, next) {
    try {
        const result = await service.getWishlist(req.user.userId);
        return res.status(200).json({ success: true, data: result.items });
    } catch (error) {
        return next(error);
    }
}

async function addWishlistItem(req, res, next) {
    try {
        const { itemId, itemType } = req.body || {};
        const result = await service.addWishlistItem(req.user.userId, itemId, itemType);
        return res.status(result.added ? 201 : 200).json({
            success: true,
            message: result.alreadyExists ? 'Item is already in your wishlist.' : 'Item added to your wishlist.',
            data: result.items,
        });
    } catch (error) {
        return next(error);
    }
}

async function removeWishlistItem(req, res, next) {
    try {
        const { itemType, itemId } = req.params;
        const result = await service.removeWishlistItem(req.user.userId, itemId, itemType);
        return res.status(200).json({
            success: true,
            message: 'Item removed from your wishlist.',
            data: result.items,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getWishlist, addWishlistItem, removeWishlistItem };
