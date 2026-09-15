'use strict';

const { ObjectId } = require('mongodb');

const repository = require('./gift-card.repository');

function createSlug(value) {
    return String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function validatePrice(value, fieldName) {
    const price = Number(value);

    if (!Number.isFinite(price) || price < 0) {
        const error = new Error(
            `${fieldName} must be a valid non-negative number`
        );

        error.statusCode = 400;

        throw error;
    }

    return price;
}

async function getGiftCardBySlug(slug) {
    if (!slug) {
        const error = new Error(
            'Gift Card slug is required'
        );

        error.statusCode = 400;

        throw error;
    }

    const giftCard =
        await repository.findBySlug(slug);

    if (!giftCard) {
        const error = new Error(
            'Gift Card not found'
        );

        error.statusCode = 404;

        throw error;
    }

    return giftCard;
}

async function getGiftCardById(id) {
    if (!id || !ObjectId.isValid(id)) {
        const error = new Error(
            'Valid Gift Card ID is required'
        );

        error.statusCode = 400;

        throw error;
    }

    const giftCard =
        await repository.findById(id);

    if (!giftCard) {
        const error = new Error(
            'Gift Card not found'
        );

        error.statusCode = 404;

        throw error;
    }

    return giftCard;
}

async function getGiftCardVariations(giftCardGroupId) {
    if (
        !giftCardGroupId ||
        !ObjectId.isValid(giftCardGroupId)
    ) {
        const error = new Error(
            'Valid gift card group ID is required'
        );

        error.statusCode = 400;

        throw error;
    }

    return repository.findByGroupId(
        giftCardGroupId
    );
}

async function createGiftCard(data = {}) {
    const title =
        String(data.title || '').trim();

    if (!title) {
        const error = new Error(
            'Gift Card title is required'
        );

        error.statusCode = 400;

        throw error;
    }

    const price = validatePrice(
        data.price ?? 0,
        'Price'
    );

    const discountPrice = validatePrice(
        data.discountPrice ?? 0,
        'Discount price'
    );

    if (discountPrice > price) {
        const error = new Error(
            'Discount price cannot be greater than price'
        );

        error.statusCode = 400;

        throw error;
    }

    const slug = createSlug(
        data.slug || title
    );

    if (!slug) {
        const error = new Error(
            'A valid gift card slug could not be generated'
        );

        error.statusCode = 400;

        throw error;
    }

    const existingGiftCard =
        await repository.findBySlug(slug);

    if (existingGiftCard) {
        const error = new Error(
            `Gift Card slug "${slug}" already exists`
        );

        error.statusCode = 409;

        throw error;
    }

    return repository.create({
        ...data,

        type: 'gift-card',

        title,
        slug,

        giftCardGroupId: null,
        var_title: null,

        item_type: 'GIFT CARD',

        price,
        discountPrice,
    });
}

async function createGiftCardWithVariations(
    data = {}
) {
    const title =
        String(data.title || '').trim();

    if (!title) {
        const error = new Error(
            'Gift Card title is required'
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        !Array.isArray(data.variations) ||
        data.variations.length === 0
    ) {
        const error = new Error(
            'At least one gift card variation is required'
        );

        error.statusCode = 400;

        throw error;
    }

    const giftCardGroupId =
        new ObjectId();

    const variationNames = new Set();
    const giftCards = [];

    const baseSlug =
        createSlug(title);

    if (!baseSlug) {
        const error = new Error(
            'A valid gift card slug could not be generated'
        );

        error.statusCode = 400;

        throw error;
    }

    for (const variation of data.variations) {
        const varTitle =
            String(
                variation.var_title || ''
            ).trim();

        if (!varTitle) {
            const error = new Error(
                'Each gift card variation must have a variation title'
            );

            error.statusCode = 400;

            throw error;
        }

        const normalizedVariationName =
            varTitle.toLowerCase();

        if (
            variationNames.has(
                normalizedVariationName
            )
        ) {
            const error = new Error(
                `Duplicate variation "${varTitle}"`
            );

            error.statusCode = 400;

            throw error;
        }

        variationNames.add(
            normalizedVariationName
        );

        const price = validatePrice(
            variation.price ?? 0,
            `Price for ${varTitle}`
        );

        const discountPrice =
            validatePrice(
                variation.discountPrice ?? 0,
                `Discount price for ${varTitle}`
            );

        if (discountPrice > price) {
            const error = new Error(
                `Discount price cannot be greater than price for ${varTitle}`
            );

            error.statusCode = 400;

            throw error;
        }

        const variationSlug =
            createSlug(varTitle);

        const slug = variationSlug
            ? `${baseSlug}-${variationSlug}`
            : baseSlug;

        giftCards.push({
            ...data,

            type: 'gift-card',

            title,
            slug,

            giftCardGroupId,
            var_title: varTitle,

            item_type: 'GIFT CARD',

            price,
            discountPrice,
        });
    }

    /*
     * Check all generated slugs
     * before inserting.
     */
    for (const giftCard of giftCards) {
        const existingGiftCard =
            await repository.findBySlug(
                giftCard.slug
            );

        if (existingGiftCard) {
            const error = new Error(
                `Gift Card slug "${giftCard.slug}" already exists`
            );

            error.statusCode = 409;

            throw error;
        }
    }

    const createdGiftCards =
        await repository.createMany(
            giftCards
        );

    return {
        giftCardGroupId,
        giftCards: createdGiftCards,
    };
}

async function updateGiftCard(id, data = {}) {
    const existingGiftCard = await repository.findById(id);

    if (!existingGiftCard) {
        const error = new Error('Gift card not found.');
        error.statusCode = 404;
        throw error;
    }

    const allowedFields = [
        'title',
        'slug',
        'var_title',

        'price',
        'discountPrice',
        'currency',

        'platform',
        'category',
        'subCategory',
        'workPlatform',

        'item',
        'item_type',

        'region',
        'card_region',

        'notice',
        'description',
        'descriptionkey',

        'publisher',
        'developer',
        'releaseDate',
        'editiondescription',
        'age',

        'minimumRequirement',
        'recommendedRequirement',

        'audio_language',
        'interface_language',
        'subtitles_language',

        'image',
        'gallery',
        'platform_image',
        'platform_icon_image',

        'status',

        'isBestSeller',
        'hideRecomend',
        'psn',

        'rating',
        'relatedProducts',

        'seo',
        'Tags',
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updateData[field] = data[field];
        }
    }

    // Validate price
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'price'
        )
    ) {
        updateData.price = validatePrice(
            updateData.price,
            'Price'
        );
    }

    // Validate discount price
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'discountPrice'
        )
    ) {
        updateData.discountPrice = validatePrice(
            updateData.discountPrice,
            'Discount price'
        );
    }

    // Compare final price values
    const finalPrice = Object.prototype.hasOwnProperty.call(
        updateData,
        'price'
    )
        ? updateData.price
        : Number(existingGiftCard.price ?? 0);

    const finalDiscountPrice =
        Object.prototype.hasOwnProperty.call(
            updateData,
            'discountPrice'
        )
            ? updateData.discountPrice
            : Number(existingGiftCard.discountPrice ?? 0);

    if (finalDiscountPrice > finalPrice) {
        const error = new Error(
            'Discount price cannot be greater than price'
        );
        error.statusCode = 400;
        throw error;
    }

    // Validate title
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'title'
        )
    ) {
        const title = String(updateData.title).trim();

        if (!title) {
            const error = new Error(
                'Gift card title is required'
            );
            error.statusCode = 400;
            throw error;
        }

        updateData.title = title;
    }

    // Validate variation title
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'var_title'
        )
    ) {
        updateData.var_title =
            updateData.var_title === null
                ? null
                : String(updateData.var_title).trim();
    }

    // Validate slug
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'slug'
        )
    ) {
        updateData.slug = createSlug(updateData.slug);

        if (!updateData.slug) {
            const error = new Error(
                'A valid gift card slug is required'
            );
            error.statusCode = 400;
            throw error;
        }

        if (updateData.slug !== existingGiftCard.slug) {
            const existingSlug =
                await repository.findBySlug(
                    updateData.slug
                );

            if (
                existingSlug &&
                existingSlug._id.toString() !==
                existingGiftCard._id.toString()
            ) {
                const error = new Error(
                    `Gift card slug "${updateData.slug}" already exists`
                );
                error.statusCode = 409;
                throw error;
            }
        }
    }

    return repository.updateById(id, updateData);
}

module.exports = {
    getGiftCardBySlug,
    getGiftCardById,
    getGiftCardVariations,
    createGiftCard,
    createGiftCardWithVariations,
    updateGiftCard,
};