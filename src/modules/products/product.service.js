'use strict';

const { ObjectId } = require('mongodb');

const repository = require('./product.repository');
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
        const error = new Error(`${fieldName} must be a valid non-negative number`);
        error.statusCode = 400;
        throw error;
    }

    return price;
}

async function getProductBySlug(slug) {
    if (!slug) {
        const error = new Error('Product slug is required');
        error.statusCode = 400;
        throw error;
    }

    const product = await repository.findPublishedBySlug(slug);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return addEffectiveAvailability(product);
}

async function getProductDetailBySlug(slug) {
    if (!slug) {
        const error = new Error('Product slug is required');
        error.statusCode = 400;
        throw error;
    }

    const product = await repository.findPublishedBySlug(slug);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    const productWithAvailability =
        await addEffectiveAvailability(product);

    let variations = [];

    if (product.productGroupId) {
        const groupProducts =
            await repository.findPublishedByGroupId(
                product.productGroupId.toString()
            );

        variations = await Promise.all(
            groupProducts.map(addEffectiveAvailability)
        );
    }

    return {
        product: productWithAvailability,
        variations,
    };
}

async function addEffectiveAvailability(product) {
    const gameKeys =
        await gameKeyRepository.findByProductId(
            product._id.toString()
        );

    const availableKeys = gameKeys.filter(
        (key) => key.isAvailable === true
    ).length;

    const isAvailable =
        product.available === true &&
        availableKeys > 0;

    return {
        ...product,
        available: isAvailable,
        availableKeys,
        stockStatus: isAvailable
            ? 'Healthy'
            : 'Out of Stock',
    };
}

async function getProductById(id) {
    if (!id || !ObjectId.isValid(id)) {
        const error = new Error('Valid product ID is required');
        error.statusCode = 400;
        throw error;
    }

    const product = await repository.findById(id);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
}

async function getProductVariations(productGroupId) {
    if (!productGroupId || !ObjectId.isValid(productGroupId)) {
        const error = new Error('Valid product group ID is required');
        error.statusCode = 400;
        throw error;
    }

    const products =
        await repository.findByGroupId(productGroupId);

    return Promise.all(
        products.map(addEffectiveAvailability)
    );
}

async function getPublishedProductVariations(productGroupId) {
    if (
        !productGroupId ||
        !ObjectId.isValid(productGroupId)
    ) {
        const error = new Error(
            'Valid product group ID is required'
        );

        error.statusCode = 400;

        throw error;
    }

    const products =
        await repository.findPublishedByGroupId(
            productGroupId
        );

    return Promise.all(
        products.map(addEffectiveAvailability)
    );
}

async function createProduct(data = {}) {
    const title = String(data.title || '').trim();

    if (!title) {
        const error = new Error('Product title is required');
        error.statusCode = 400;
        throw error;
    }

    const price = validatePrice(data.price ?? 0, 'Price');

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

    const slug = createSlug(data.slug || title);

    if (!slug) {
        const error = new Error(
            'A valid product slug could not be generated'
        );
        error.statusCode = 400;
        throw error;
    }

    const existingProduct = await repository.findBySlug(slug);

    if (existingProduct) {
        const error = new Error(
            `Product slug "${slug}" already exists`
        );
        error.statusCode = 409;
        throw error;
    }

    // const product = await repository.create({
    //     ...data,

    //     title,
    //     slug,

    //     // A normal product has no variation group.
    //     productGroupId: null,
    //     var_title: null,

    //     price,
    //     discountPrice,
    // });

    const product = await repository.create({
        // Identity
        title,
        slug,
        type: "product",

        // Variation
        productGroupId: null,
        var_title: null,

        // Pricing
        price,
        discountPrice,
        currency: data.currency ?? "INR",

        // Classification
        platform: data.platform ?? null,
        category: data.category ?? null,
        subCategory: data.subCategory ?? null,
        workPlatform: data.workPlatform ?? null,

        item: data.item ?? "DIGITAL KEY",
        item_type: data.item_type ?? "GAME",

        // Region
        region: data.region ?? null,
        // card_region: data.card_region ?? null,

        // Content
        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,

        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,
        editiondescription: data.editiondescription ?? null,
        age: data.age ?? null,

        // Requirements
        minimumRequirement: data.minimumRequirement ?? null,
        recommendedRequirement: data.recommendedRequirement ?? null,

        // Languages
        audio_language: data.audio_language ?? [],
        interface_language: data.interface_language ?? [],
        subtitles_language: data.subtitles_language ?? [],

        // Media
        image: data.image ?? null,
        gallery: data.gallery ?? [],
        platform_image: data.platform_image ?? null,
        platform_icon_image: data.platform_icon_image ?? null,

        // State
        status: data.status ?? "draft",
        available: data.available ?? false,

        // Flags
        isBestSeller: data.isBestSeller ?? false,
        isRecommended: data.isRecommended ?? false,
        psn: data.psn ?? false,

        // Rating
        rating: data.rating ?? 0,

        // Relationships
        relatedProducts: data.relatedProducts ?? [],

        // SEO
        seo: data.seo ?? null,
        Tags: data.Tags ?? [],
    });

    return product;
}

async function createProductWithVariations(data = {}) {
    const title = String(data.title || '').trim();

    if (!title) {
        const error = new Error('Product title is required');
        error.statusCode = 400;
        throw error;
    }

    // Parent SKU pricing
    const price = validatePrice(data.price ?? 0, 'Price');

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

    // Parent SKU region
    const parentRegion = String(data.region || '').trim();

    if (!parentRegion) {
        const error = new Error('Product region is required');
        error.statusCode = 400;
        throw error;
    }

    // Parent SKU edition
    const parentVarTitle = String(data.var_title || '').trim();

    if (!parentVarTitle) {
        const error = new Error(
            'Product edition is required'
        );
        error.statusCode = 400;
        throw error;
    }

    // Additional child SKUs
    if (!Array.isArray(data.regions) || data.regions.length === 0) {
        const error = new Error(
            'At least one product region is required'
        );
        error.statusCode = 400;
        throw error;
    }

    const productGroupId = new ObjectId();

    /*
     * ---------------------------------------------------------
     * Parent SKU
     * ---------------------------------------------------------
     */

    const parentSlug = createSlug(data.slug || title);

    if (!parentSlug) {
        const error = new Error(
            'A valid product slug could not be generated'
        );
        error.statusCode = 400;
        throw error;
    }

    /*
     * Track SKU combinations so the parent cannot be duplicated
     * by one of the child SKUs.
     */
    const skuCombinations = new Set();

    const parentCombination =
        `${parentRegion.toLowerCase()}::${parentVarTitle.toLowerCase()}`;

    skuCombinations.add(parentCombination);

    /*
     * ---------------------------------------------------------
     * Validate and prepare child SKUs
     * ---------------------------------------------------------
     */

    const childProducts = [];
    const generatedSlugs = new Set([parentSlug]);

    for (const regionData of data.regions) {
        const region = String(regionData?.region || '').trim();

        if (!region) {
            const error = new Error(
                'Each product region must have a region name'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            !Array.isArray(regionData.editions) ||
            regionData.editions.length === 0
        ) {
            const error = new Error(
                `Region "${region}" must contain at least one edition`
            );
            error.statusCode = 400;
            throw error;
        }

        for (const edition of regionData.editions) {
            const varTitle = String(
                edition?.var_title || ''
            ).trim();

            const childTitle = String(
                edition?.title || ''
            ).trim();

            if (!varTitle) {
                const error = new Error(
                    `Each edition in "${region}" must have an edition title`
                );
                error.statusCode = 400;
                throw error;
            }

            if (!childTitle) {
                const error = new Error(
                    `Each edition in "${region}" must have a product title`
                );
                error.statusCode = 400;
                throw error;
            }

            const combination =
                `${region.toLowerCase()}::${varTitle.toLowerCase()}`;

            if (skuCombinations.has(combination)) {
                const error = new Error(
                    `Duplicate product SKU: ${region} / ${varTitle}`
                );
                error.statusCode = 400;
                throw error;
            }

            skuCombinations.add(combination);

            const childPrice = validatePrice(
                edition.price ?? 0,
                `Price for ${childTitle}`
            );

            const childDiscountPrice = validatePrice(
                edition.discountPrice ?? 0,
                `Discount price for ${childTitle}`
            );

            if (childDiscountPrice > childPrice) {
                const error = new Error(
                    `Discount price cannot be greater than price for ${childTitle}`
                );
                error.statusCode = 400;
                throw error;
            }

            /*
             * Child slug is based on its own title.
             */

            let childSlug = createSlug(edition?.slug || childTitle);

            if (!childSlug) {
                const error = new Error(
                    `A valid product slug could not be generated for "${childTitle}"`
                );
                error.statusCode = 400;
                throw error;
            }

            /*
             * Slugs must be unique inside this creation request.
             *
             * If two child titles generate the same slug,
             * append the region and edition.
             */
            if (generatedSlugs.has(childSlug)) {
                const regionSlug = createSlug(region);
                const editionSlug = createSlug(varTitle);

                childSlug = [
                    childSlug,
                    regionSlug,
                    editionSlug,
                ]
                    .filter(Boolean)
                    .join('-');
            }

            /*
             * If it still conflicts, keep adding a numeric suffix.
             */
            let slugCandidate = childSlug;
            let suffix = 2;

            while (generatedSlugs.has(slugCandidate)) {
                slugCandidate = `${childSlug}-${suffix}`;
                suffix += 1;
            }

            childSlug = slugCandidate;

            generatedSlugs.add(childSlug);

            childProducts.push({
                type: 'product',

                // Identity
                title: childTitle,
                slug: childSlug,

                // Variation family
                productGroupId,
                isParent: false,
                parentProductId: null,
                var_title: varTitle,

                // Pricing
                price: childPrice,
                discountPrice: childDiscountPrice,
                currency: data.currency ?? 'INR',

                // Classification
                platform: data.platform ?? null,
                category: data.category ?? null,
                subCategory: data.subCategory ?? null,
                workPlatform: data.workPlatform ?? null,

                item: data.item ?? 'DIGITAL KEY',
                item_type: data.item_type ?? 'GAME',

                // Region
                region,

                // Content
                notice: data.notice ?? null,
                description: data.description ?? null,
                descriptionkey: data.descriptionkey ?? null,

                publisher: data.publisher ?? null,
                developer: data.developer ?? null,
                releaseDate: data.releaseDate ?? null,
                editiondescription: data.editiondescription ?? null,
                age: data.age ?? null,

                // Requirements
                minimumRequirement:
                    data.minimumRequirement ?? null,

                recommendedRequirement:
                    data.recommendedRequirement ?? null,

                // Languages
                audio_language:
                    data.audio_language ?? [],

                interface_language:
                    data.interface_language ?? [],

                subtitles_language:
                    data.subtitles_language ?? [],

                // Media
                image: data.image ?? null,
                gallery: data.gallery ?? [],
                platform_image:
                    data.platform_image ?? null,

                platform_icon_image:
                    data.platform_icon_image ?? null,

                // State
                status: data.status ?? 'draft',
                available: data.available ?? false,

                // Flags
                isBestSeller:
                    data.isBestSeller ?? false,

                isRecommended:
                    data.isRecommended ?? false,

                psn: data.psn ?? false,

                // Rating
                rating: data.rating ?? 0,

                // Relationships
                relatedProducts:
                    data.relatedProducts ?? [],

                // SEO
                seo: data.seo ?? null,
                Tags: data.Tags ?? [],
            });
        }
    }

    /*
     * ---------------------------------------------------------
     * Check all slugs against the database BEFORE inserting.
     * ---------------------------------------------------------
     */

    const allSlugs = [
        parentSlug,
        ...childProducts.map((product) => product.slug),
    ];

    for (const slug of allSlugs) {
        const existingProduct =
            await repository.findBySlug(slug);

        if (existingProduct) {
            const error = new Error(
                `Product slug "${slug}" already exists`
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

    const parentProduct = await repository.create({
        type: 'product',

        // Identity
        title,
        slug: parentSlug,

        // Variation family
        productGroupId,
        isParent: true,
        parentProductId: null,
        var_title: parentVarTitle,

        // Pricing
        price,
        discountPrice,
        currency: data.currency ?? 'INR',

        // Classification
        platform: data.platform ?? null,
        category: data.category ?? null,
        subCategory: data.subCategory ?? null,
        workPlatform: data.workPlatform ?? null,

        item: data.item ?? 'DIGITAL KEY',
        item_type: data.item_type ?? 'GAME',

        // Region
        region: parentRegion,

        // Content
        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,

        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,
        editiondescription: data.editiondescription ?? null,
        age: data.age ?? null,

        // Requirements
        minimumRequirement:
            data.minimumRequirement ?? null,

        recommendedRequirement:
            data.recommendedRequirement ?? null,

        // Languages
        audio_language:
            data.audio_language ?? [],

        interface_language:
            data.interface_language ?? [],

        subtitles_language:
            data.subtitles_language ?? [],

        // Media
        image: data.image ?? null,
        gallery: data.gallery ?? [],
        platform_image:
            data.platform_image ?? null,

        platform_icon_image:
            data.platform_icon_image ?? null,

        // State
        status: data.status ?? 'draft',
        available: data.available ?? false,

        // Flags
        isBestSeller:
            data.isBestSeller ?? false,

        isRecommended:
            data.isRecommended ?? false,

        psn: data.psn ?? false,

        // Rating
        rating: data.rating ?? 0,

        // Relationships
        relatedProducts:
            data.relatedProducts ?? [],

        // SEO
        seo: data.seo ?? null,
        Tags: data.Tags ?? [],
    });

    /*
     * ---------------------------------------------------------
     * Create all child SKUs
     * ---------------------------------------------------------
     */

    let createdChildren = [];

    for (const childProduct of childProducts) {
        childProduct.parentProductId = parentProduct._id;
    }

    if (childProducts.length > 0) {
        createdChildren =
            await repository.createMany(childProducts);
    }

    /*
     * Parent is also a sellable SKU, so return it together
     * with all child SKUs.
     */
    return {
        productGroupId,
        parent: parentProduct,
        products: [
            parentProduct,
            ...createdChildren,
        ],
    };
}

async function addProductVariation(parentProductId, data = {}) {
    if (!parentProductId || !ObjectId.isValid(parentProductId)) {
        const error = new Error('Valid parent product ID is required');
        error.statusCode = 400;
        throw error;
    }

    const parentProduct = await repository.findById(parentProductId);

    if (!parentProduct) {
        const error = new Error('Parent product not found');
        error.statusCode = 404;
        throw error;
    }

    // If an existing child ID is supplied, resolve the real parent.
    let parent = parentProduct;

    if (
        parentProduct.isParent === false &&
        parentProduct.parentProductId
    ) {
        parent = await repository.findById(
            parentProduct.parentProductId.toString()
        );

        if (!parent) {
            const error = new Error(
                'The parent product for this variation could not be found'
            );
            error.statusCode = 404;
            throw error;
        }
    }

    if (parent.isParent !== true) {
        const error = new Error(
            'The selected product is not a valid variation parent'
        );
        error.statusCode = 400;
        throw error;
    }

    if (!parent.productGroupId) {
        const error = new Error(
            'The parent product does not have a product group'
        );
        error.statusCode = 400;
        throw error;
    }

    // ---------------------------------------------------------
    // Validate child fields
    // ---------------------------------------------------------

    const title = String(data.title || '').trim();

    if (!title) {
        const error = new Error('Product title is required');
        error.statusCode = 400;
        throw error;
    }

    const region = String(data.region || '').trim();

    if (!region) {
        const error = new Error('Product region is required');
        error.statusCode = 400;
        throw error;
    }

    const varTitle = String(data.var_title || '').trim();

    if (!varTitle) {
        const error = new Error('Product edition is required');
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

    // ---------------------------------------------------------
    // Prevent duplicate Region + Edition inside this group
    // ---------------------------------------------------------

    const existingVariations =
        await repository.findByGroupId(
            parent.productGroupId.toString()
        );

    const combination =
        `${region.toLowerCase()}::${varTitle.toLowerCase()}`;

    const duplicateVariation = existingVariations.find(
        (product) =>
            `${String(product.region || '').trim().toLowerCase()}::${String(
                product.var_title || ''
            ).trim().toLowerCase()}` === combination
    );

    if (duplicateVariation) {
        const error = new Error(
            `Product SKU "${region} / ${varTitle}" already exists in this product group`
        );
        error.statusCode = 409;
        throw error;
    }

    // ---------------------------------------------------------
    // Create child slug
    // ---------------------------------------------------------

    let slug = createSlug(data.slug || title);

    if (!slug) {
        const error = new Error(
            `A valid product slug could not be generated for "${title}"`
        );
        error.statusCode = 400;
        throw error;
    }

    // Make sure slug is globally unique.
    const originalSlug = slug;
    let suffix = 2;

    while (await repository.findBySlug(slug)) {
        slug = `${originalSlug}-${suffix}`;
        suffix += 1;
    }

    // ---------------------------------------------------------
    // Create child SKU
    // ---------------------------------------------------------

    const childProduct = await repository.create({
        type: 'product',

        // Identity
        title,
        slug,

        // Variation family
        productGroupId: parent.productGroupId,
        isParent: false,
        parentProductId: parent._id,
        var_title: varTitle,

        // Pricing
        price,
        discountPrice,
        currency: data.currency ?? parent.currency ?? 'INR',

        // Classification
        platform: data.platform ?? parent.platform ?? null,
        category: data.category ?? parent.category ?? null,
        subCategory: data.subCategory ?? parent.subCategory ?? null,
        workPlatform: data.workPlatform ?? parent.workPlatform ?? null,

        item: data.item ?? parent.item ?? 'DIGITAL KEY',
        item_type: data.item_type ?? parent.item_type ?? 'GAME',

        // Region
        region,

        // Content
        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,

        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,
        editiondescription: data.editiondescription ?? null,
        age: data.age ?? null,

        // Requirements
        minimumRequirement:
            data.minimumRequirement ?? null,

        recommendedRequirement:
            data.recommendedRequirement ?? null,

        // Languages
        audio_language:
            data.audio_language ?? [],

        interface_language:
            data.interface_language ?? [],

        subtitles_language:
            data.subtitles_language ?? [],

        // Media
        image: data.image ?? null,
        gallery: data.gallery ?? [],
        platform_image:
            data.platform_image ?? null,

        platform_icon_image:
            data.platform_icon_image ?? null,

        // State
        status: data.status ?? parent.status ?? 'draft',
        available: data.available ?? false,

        // Flags
        isBestSeller:
            data.isBestSeller ?? parent.isBestSeller ?? false,

        isRecommended:
            data.isRecommended ?? parent.isRecommended ?? false,

        psn:
            data.psn ?? parent.psn ?? false,

        // Rating
        rating: data.rating ?? 0,

        // Relationships
        relatedProducts:
            data.relatedProducts ?? [],

        // SEO
        seo: data.seo ?? null,
        Tags: data.Tags ?? [],
    });

    return childProduct;
}

async function updateProduct(id, data = {}) {
    const existingProduct = await repository.findById(id);

    if (!existingProduct) {
        const error = new Error('Product not found.');
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
        'available',
        'isBestSeller',
        'isRecommended',
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

    // Validate price if supplied
    if (Object.prototype.hasOwnProperty.call(updateData, 'price')) {
        updateData.price = validatePrice(
            updateData.price,
            'Price'
        );
    }

    // Validate discount price if supplied
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
        : Number(existingProduct.price ?? 0);

    const finalDiscountPrice =
        Object.prototype.hasOwnProperty.call(
            updateData,
            'discountPrice'
        )
            ? updateData.discountPrice
            : Number(existingProduct.discountPrice ?? 0);

    if (finalDiscountPrice > finalPrice) {
        const error = new Error(
            'Discount price cannot be greater than price'
        );
        error.statusCode = 400;
        throw error;
    }

    // Validate title if supplied
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'title'
        )
    ) {
        const title = String(updateData.title).trim();

        if (!title) {
            const error = new Error(
                'Product title is required'
            );
            error.statusCode = 400;
            throw error;
        }

        updateData.title = title;
    }

    // Validate variation title if supplied
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

    // Check slug uniqueness if slug is changed
    if (
        Object.prototype.hasOwnProperty.call(
            updateData,
            'slug'
        )
    ) {
        updateData.slug = createSlug(updateData.slug);

        if (!updateData.slug) {
            const error = new Error(
                'A valid product slug is required'
            );
            error.statusCode = 400;
            throw error;
        }

        if (updateData.slug !== existingProduct.slug) {
            const existingSlug = await repository.findBySlug(
                updateData.slug
            );

            if (
                existingSlug &&
                existingSlug._id.toString() !==
                existingProduct._id.toString()
            ) {
                const error = new Error(
                    `Product slug "${updateData.slug}" already exists`
                );
                error.statusCode = 409;
                throw error;
            }
        }
    }

    return repository.updateById(id, updateData);
}

async function deleteProduct(id) {
    if (!id || !ObjectId.isValid(id)) {
        const error = new Error('Valid product ID is required');
        error.statusCode = 400;
        throw error;
    }

    const existingProduct = await repository.findById(id);

    if (!existingProduct) {
        const error = new Error('Product not found.');
        error.statusCode = 404;
        throw error;
    }

    // Find keys belonging only to this exact product variation.
    const gameKeys = await gameKeyRepository.findByProductId(id);

    // Never delete a product that already has assigned/sold keys.
    const assignedKeys = gameKeys.filter(
        (key) => key.isAvailable === false
    );

    if (assignedKeys.length > 0) {
        const error = new Error(
            'This product cannot be deleted because it has assigned or sold game keys.'
        );

        error.statusCode = 409;
        throw error;
    }

    // Delete only available keys belonging to this exact product.
    for (const gameKey of gameKeys) {
        await gameKeyRepository.deleteById(
            gameKey._id.toString()
        );
    }

    // Delete only this product variation.
    const deletedProduct = await repository.deleteById(id);

    return {
        product: deletedProduct,
        deletedGameKeys: gameKeys.length,
    };
}

async function getPublishedRecommendedProducts(limit = 12) {
    const products =
        await repository.findPublishedRecommended(limit);

    return Promise.all(
        products.map(addEffectiveAvailability)
    );
}

async function getPublishedBestSellingProducts(limit = 30) {
    const products =
        await repository.findPublishedBestSelling(limit);

    return Promise.all(
        products.map(addEffectiveAvailability)
    );
}

module.exports = {
    getProductBySlug,
    getProductDetailBySlug,
    getProductById,
    getProductVariations,
    getPublishedProductVariations,
    createProduct,
    createProductWithVariations,
    addProductVariation,
    updateProduct,
    deleteProduct,
    getPublishedRecommendedProducts,
    getPublishedBestSellingProducts,
    addEffectiveAvailability,
};