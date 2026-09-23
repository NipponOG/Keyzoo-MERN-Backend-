'use strict';

const { ObjectId } = require('mongodb');

const repository = require('./gift-card.repository');

const gameKeyRepository = require('../game-keys/game-key.repository');

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

    const giftCard = await repository.findPublishedBySlug(slug);

    if (!giftCard) {
        const error = new Error(
            'Gift Card not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return addEffectiveAvailability(giftCard);
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

    const giftCards =
        await repository.findByGroupId(
            giftCardGroupId
        );

    return Promise.all(
        giftCards.map(addEffectiveAvailability)
    );
}

async function getPublishedGiftCardVariations(
    giftCardGroupId
) {
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

    const giftCards =
        await repository.findPublishedByGroupId(
            giftCardGroupId
        );

    return Promise.all(
        giftCards.map(addEffectiveAvailability)
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

async function createGiftCardWithVariations(data = {}) {
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

    const giftCardGroupId = new ObjectId();

    /*
     * ---------------------------------------------------------
     * Parent SKU
     * ---------------------------------------------------------
     */

    const parentRegion =
        String(data.region || '').trim();

    if (!parentRegion) {
        const error = new Error(
            'Gift Card region is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const parentVarTitle =
        String(data.var_title || '').trim();

    if (!parentVarTitle) {
        const error = new Error(
            'Gift Card variation title is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const parentPrice = validatePrice(
        data.price ?? 0,
        'Price'
    );

    const parentDiscountPrice = validatePrice(
        data.discountPrice ?? 0,
        'Discount price'
    );

    if (parentDiscountPrice > parentPrice) {
        const error = new Error(
            'Discount price cannot be greater than price'
        );

        error.statusCode = 400;
        throw error;
    }

    const parentSlug =
        createSlug(data.slug || title);

    if (!parentSlug) {
        const error = new Error(
            'A valid gift card slug could not be generated'
        );

        error.statusCode = 400;
        throw error;
    }

    /*
     * ---------------------------------------------------------
     * Validate and prepare child SKUs
     * ---------------------------------------------------------
     */

    const variationNames = new Set();

    const childGiftCards = [];

    const generatedSlugs = new Set([
        parentSlug,
    ]);

    /*
     * Parent itself is a valid SKU combination.
     */
    const parentCombination =
        `${parentRegion.toLowerCase()}::${parentVarTitle.toLowerCase()}`;

    variationNames.add(parentCombination);

    for (const variation of data.variations) {
        const varTitle =
            String(
                variation?.var_title || ''
            ).trim();

        if (!varTitle) {
            const error = new Error(
                'Each gift card variation must have a variation title'
            );

            error.statusCode = 400;
            throw error;
        }

        const region =
            String(
                variation?.region ||
                data.region ||
                ''
            ).trim();

        if (!region) {
            const error = new Error(
                `Gift card variation "${varTitle}" must have a region`
            );

            error.statusCode = 400;
            throw error;
        }

        const normalizedVariationName =
            `${region.toLowerCase()}::${varTitle.toLowerCase()}`;

        if (
            variationNames.has(
                normalizedVariationName
            )
        ) {
            const error = new Error(
                `Duplicate gift card variation "${region} / ${varTitle}"`
            );

            error.statusCode = 400;
            throw error;
        }

        variationNames.add(
            normalizedVariationName
        );

        const variationTitle =
            String(
                variation.title ||
                title
            ).trim();

        if (!variationTitle) {
            const error = new Error(
                `Gift card title is required for "${varTitle}"`
            );

            error.statusCode = 400;
            throw error;
        }

        const price = validatePrice(
            variation.price ?? 0,
            `Price for ${variationTitle}`
        );

        const discountPrice =
            validatePrice(
                variation.discountPrice ?? 0,
                `Discount price for ${variationTitle}`
            );

        if (discountPrice > price) {
            const error = new Error(
                `Discount price cannot be greater than price for ${variationTitle}`
            );

            error.statusCode = 400;
            throw error;
        }

        /*
         * Child slug:
         * use manually entered slug when supplied,
         * otherwise generate from child title.
         */
        let childSlug =
            createSlug(
                variation.slug ||
                variationTitle
            );

        if (!childSlug) {
            const error = new Error(
                `A valid gift card slug could not be generated for "${variationTitle}"`
            );

            error.statusCode = 400;
            throw error;
        }

        /*
         * Prevent duplicate slugs inside this request.
         */
        if (generatedSlugs.has(childSlug)) {
            const regionSlug =
                createSlug(region);

            const variationSlug =
                createSlug(varTitle);

            childSlug = [
                childSlug,
                regionSlug,
                variationSlug,
            ]
                .filter(Boolean)
                .join('-');
        }

        let slugCandidate = childSlug;
        let suffix = 2;

        while (
            generatedSlugs.has(slugCandidate)
        ) {
            slugCandidate =
                `${childSlug}-${suffix}`;

            suffix += 1;
        }

        childSlug = slugCandidate;

        generatedSlugs.add(childSlug);

        childGiftCards.push({
            ...data,
            ...variation,

            type: 'gift-card',

            /*
             * Identity
             */
            title: variationTitle,
            slug: childSlug,

            /*
             * Variation family
             */
            giftCardGroupId,
            isParent: false,
            parentGiftCardId: null,
            var_title: varTitle,

            /*
             * Region
             */
            region,

            /*
             * Gift Card
             */
            item_type: 'GIFT CARD',

            /*
             * Pricing
             */
            price,
            discountPrice,
        });
    }

    /*
     * ---------------------------------------------------------
     * Check all slugs against the database BEFORE inserting.
     * ---------------------------------------------------------
     */

    const allSlugs = [
        parentSlug,
        ...childGiftCards.map(
            (giftCard) => giftCard.slug
        ),
    ];

    for (const slug of allSlugs) {
        const existingGiftCard =
            await repository.findBySlug(slug);

        if (existingGiftCard) {
            const error = new Error(
                `Gift Card slug "${slug}" already exists`
            );

            error.statusCode = 409;
            throw error;
        }
    }

    /*
     * ---------------------------------------------------------
     * Create the parent SKU
     * ---------------------------------------------------------
     */

    const parentGiftCard =
        await repository.create({
            ...data,

            type: 'gift-card',

            /*
             * Identity
             */
            title,
            slug: parentSlug,

            /*
             * Variation family
             */
            giftCardGroupId,
            isParent: true,
            parentGiftCardId: null,
            var_title: parentVarTitle,

            /*
             * Region
             */
            region: parentRegion,

            /*
             * Gift Card
             */
            item_type: 'GIFT CARD',

            /*
             * Pricing
             */
            price: parentPrice,
            discountPrice: parentDiscountPrice,
        });

    /*
     * ---------------------------------------------------------
     * Create all child SKUs
     * ---------------------------------------------------------
     */

    let createdChildren = [];

    for (const childGiftCard of childGiftCards) {
        childGiftCard.parentGiftCardId =
            parentGiftCard._id;
    }

    if (childGiftCards.length > 0) {
        createdChildren =
            await repository.createMany(
                childGiftCards
            );
    }

    /*
     * Parent is also a sellable SKU.
     */
    return {
        giftCardGroupId,

        parent: parentGiftCard,

        giftCards: [
            parentGiftCard,
            ...createdChildren,
        ],
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
        'isRecommended',
        'psn',
        'available',

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

async function deleteGiftCard(id) {
    if (!id || !ObjectId.isValid(id)) {
        const error = new Error(
            'Valid Gift Card ID is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const existingGiftCard =
        await repository.findById(id);

    if (!existingGiftCard) {
        const error = new Error(
            'Gift card not found.'
        );

        error.statusCode = 404;
        throw error;
    }

    // Find keys belonging only to this exact
    // gift card variation.
    const gameKeys =
        await gameKeyRepository.findByGiftCardId(id);

    // Never delete a gift card that has
    // assigned or sold keys.
    const assignedKeys = gameKeys.filter(
        (key) => key.isAvailable === false
    );

    if (assignedKeys.length > 0) {
        const error = new Error(
            'This gift card cannot be deleted because it has assigned or sold game keys.'
        );

        error.statusCode = 409;
        throw error;
    }

    // Delete only available keys belonging
    // to this exact gift card variation.
    for (const gameKey of gameKeys) {
        await gameKeyRepository.deleteById(
            gameKey._id.toString()
        );
    }

    // Delete only this exact gift card variation.
    const deletedGiftCard =
        await repository.deleteById(id);

    return {
        giftCard: deletedGiftCard,
        deletedGameKeys: gameKeys.length,
    };
}

async function getPublishedRecommendedGiftCards(limit = 12) {
    const giftCards =
        await repository.findPublishedRecommended(limit);

    return Promise.all(
        giftCards.map(addEffectiveAvailability)
    );
}

async function getPublishedBestSellingGiftCards(limit = 30) {
    const giftCards =
        await repository.findPublishedBestSelling(limit);

    return Promise.all(
        giftCards.map(addEffectiveAvailability)
    );
}

async function addEffectiveAvailability(giftCard) {
    const gameKeys =
        await gameKeyRepository.findByGiftCardId(
            giftCard._id.toString()
        );

    const availableKeys = gameKeys.filter(
        (key) => key.isAvailable === true
    ).length;

    const isAvailable =
        giftCard.available === true &&
        availableKeys > 0;

    return {
        ...giftCard,
        available: isAvailable,
        availableKeys,
        stockStatus: isAvailable
            ? 'Healthy'
            : 'Out of Stock',
    };
}

module.exports = {
    getGiftCardBySlug,
    getGiftCardById,
    getGiftCardVariations,
    getPublishedGiftCardVariations,
    getPublishedRecommendedGiftCards,
    getPublishedBestSellingGiftCards,
    createGiftCard,
    createGiftCardWithVariations,
    addEffectiveAvailability,
    updateGiftCard,
    deleteGiftCard,
};