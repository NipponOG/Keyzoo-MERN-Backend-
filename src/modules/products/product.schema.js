'use strict';

/**
 * Creates a clean product document.
 * This is NOT a MongoDB schema.
 */
function createProductDocument(data = {}) {
    const now = new Date();

    return {
        type: 'product',

        // Identity
        title: data.title ?? '',
        slug: data.slug ?? '',

        // Product group / variation
        productGroupId: data.productGroupId ?? null,
        var_title: data.var_title ?? null,

        // Pricing
        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? 0,
        currency: data.currency ?? 'INR',

        // Product classification
        platform: data.platform ?? null,
        category: data.category ?? null,
        subCategory: data.subCategory ?? null,
        workPlatform: data.workPlatform ?? null,

        item: data.item ?? 'DIGITAL KEY',
        item_type: data.item_type ?? 'GAME',

        // Region
        region: data.region ?? null,
        // card_region: data.card_region ?? null,   No longer needed,

        // Content
        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,

        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,
        editiondescription: data.editiondescription ?? null,
        age: data.age ?? null,

        // System requirements
        minimumRequirement: data.minimumRequirement ?? {
            os: null,
            processor: null,
            memory: null,
            graphics: null,
            storage: null,
            sound: null,
            additional_notes: null,
        },

        recommendedRequirement: data.recommendedRequirement ?? {
            os: null,
            processor: null,
            memory: null,
            graphics: null,
            storage: null,
            sound: null,
            additional_notes: null,
        },

        // Languages
        audio_language: data.audio_language ?? [],
        interface_language: data.interface_language ?? [],
        subtitles_language: data.subtitles_language ?? [],

        // Media
        image: data.image ?? null,
        gallery: data.gallery ?? [],

        platform_image: data.platform_image ?? null,
        platform_icon_image: data.platform_icon_image ?? null,

        // Product state
        status: data.status ?? 'draft',

        // Product flags
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

        // Timestamps
        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createProductDocument,
};