'use strict';

const { ObjectId } = require('mongodb');
const { getDatabase } = require('../../config/database');
const wishlistRepository = require('./wishlist.repository');
const productRepository = require('../products/product.repository');
const giftCardRepository = require('../gift-cards/gift-card.repository');

const ALLOWED_TYPES = new Set(['product', 'gift-card']);

function httpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function parseItem(itemId, itemType) {
    if (typeof itemId !== 'string' || !ObjectId.isValid(itemId)) {
        throw httpError('A valid itemId is required.', 400);
    }
    if (!ALLOWED_TYPES.has(itemType)) {
        throw httpError('itemType must be either product or gift-card.', 400);
    }
    return new ObjectId(itemId);
}

function serializeItem(document, itemType, addedAt) {
    return {
        _id: document._id.toString(),
        id: document._id.toString(),
        type: itemType,
        slug: document.slug || '',
        title: document.title || '',
        image: document.image || null,
        platform: document.platform || null,
        region: itemType === 'gift-card'
            ? (document.card_region || document.region || null)
            : (document.region || null),
        price: document.price ?? 0,
        discountPrice: document.discountPrice ?? 0,
        currency: document.currency || 'INR',
        status: document.status || 'unavailable',
        available: document.available === true,
        addedAt: addedAt || null,
    };
}

async function getWishlist(userId) {
    const wishlist = await wishlistRepository.findByUserId(userId);
    if (!wishlist || !Array.isArray(wishlist.items) || wishlist.items.length === 0) {
        return { items: [] };
    }

    const productIds = wishlist.items
        .filter((item) => item.itemType === 'product')
        .map((item) => item.itemId);
    const giftCardIds = wishlist.items
        .filter((item) => item.itemType === 'gift-card')
        .map((item) => item.itemId);

    const [products, giftCards] = await Promise.all([
        productIds.length
            ? getDatabase().collection('products')
                .find({ _id: { $in: productIds }, type: 'product', status: 'published' }).toArray()
            : [],
        giftCardIds.length
            ? getDatabase().collection('gift_cards')
                .find({ _id: { $in: giftCardIds }, type: 'gift-card', status: 'published' }).toArray()
            : [],
    ]);

    const productMap = new Map(products.map((item) => [item._id.toString(), item]));
    const giftCardMap = new Map(giftCards.map((item) => [item._id.toString(), item]));

    const items = wishlist.items.flatMap((entry) => {
        const id = entry.itemId.toString();
        const document = entry.itemType === 'product'
            ? productMap.get(id)
            : giftCardMap.get(id);
        return document ? [serializeItem(document, entry.itemType, entry.addedAt)] : [];
    });

    return { items };
}

async function addWishlistItem(userId, itemId, itemType) {
    const objectId = parseItem(itemId, itemType);
    const repository = itemType === 'product' ? productRepository : giftCardRepository;
    const document = await repository.findById(objectId.toString());

    if (!document || document.status !== 'published') {
        throw httpError('This item is not available to add to your wishlist.', 404);
    }

    const result = await wishlistRepository.addItem(userId, objectId, itemType);
    return {
        added: result.modifiedCount === 1,
        alreadyExists: result.modifiedCount === 0,
        ...(await getWishlist(userId)),
    };
}

async function removeWishlistItem(userId, itemId, itemType) {
    const objectId = parseItem(itemId, itemType);
    await wishlistRepository.removeItem(userId, objectId, itemType);
    return getWishlist(userId);
}

module.exports = {
    getWishlist,
    addWishlistItem,
    removeWishlistItem,
};
