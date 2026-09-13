'use strict';

const { ObjectId } = require('mongodb');

const repository = require('./product.repository');

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

    const product = await repository.findBySlug(slug);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
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

    return repository.findByGroupId(productGroupId);
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

        // Flags
        isBestSeller: data.isBestSeller ?? false,
        hideRecomend: data.hideRecomend ?? false,
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

    if (!Array.isArray(data.variations) || data.variations.length === 0) {
        const error = new Error(
            'At least one product variation is required'
        );
        error.statusCode = 400;
        throw error;
    }

    const productGroupId = new ObjectId();

    const variationNames = new Set();
    const products = [];

    const baseSlug = createSlug(title);

    if (!baseSlug) {
        const error = new Error(
            'A valid product slug could not be generated'
        );
        error.statusCode = 400;
        throw error;
    }

    for (const variation of data.variations) {
        const varTitle = String(variation.var_title || '').trim();

        if (!varTitle) {
            const error = new Error(
                'Each variation must have a variation title'
            );
            error.statusCode = 400;
            throw error;
        }

        const normalizedVariationName = varTitle.toLowerCase();

        if (variationNames.has(normalizedVariationName)) {
            const error = new Error(
                `Duplicate variation "${varTitle}"`
            );
            error.statusCode = 400;
            throw error;
        }

        variationNames.add(normalizedVariationName);

        const price = validatePrice(
            variation.price ?? 0,
            `Price for ${varTitle}`
        );

        const discountPrice = validatePrice(
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

        const variationSlug = createSlug(varTitle);

        const slug = variationSlug
            ? `${baseSlug}-${variationSlug}`
            : baseSlug;

        // products.push({
        //     ...data,

        //     title,
        //     slug,

        //     productGroupId,
        //     var_title: varTitle,

        //     price,
        //     discountPrice,

        //     // Variations are controlled by the variation object.
        //     // variations: undefined,
        // });

        products.push({
            // Identity
            type: "product",
            title,
            slug,

            // Variation
            productGroupId,
            var_title: varTitle,

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

            // Flags
            isBestSeller: data.isBestSeller ?? false,
            hideRecomend: data.hideRecomend ?? false,
            psn: data.psn ?? false,

            // Rating
            rating: data.rating ?? 0,

            // Relationships
            relatedProducts: data.relatedProducts ?? [],

            // SEO
            seo: data.seo ?? null,
            Tags: data.Tags ?? [],
        });

    }

    /*
     * Check all generated slugs before inserting.
     */
    for (const product of products) {
        const existingProduct = await repository.findBySlug(product.slug);

        if (existingProduct) {
            const error = new Error(
                `Product slug "${product.slug}" already exists`
            );
            error.statusCode = 409;
            throw error;
        }
    }

    const createdProducts = await repository.createMany(products);

    return {
        productGroupId,
        products: createdProducts,
    };
}

module.exports = {
    getProductBySlug,
    getProductById,
    getProductVariations,
    createProduct,
    createProductWithVariations,
};