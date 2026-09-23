'use strict';

/**
 * Creates a clean product document.
 * This is NOT a MongoDB schema.
 */
function createProductDocument(data = {}) {
    const now = new Date();

    return {
        type: 'product',

        // Product family
        productGroupId: data.productGroupId ?? null,

        // Parent / child relationship
        isParent: data.isParent ?? false,
        parentProductId: data.parentProductId ?? null,

        // Product identity
        title: data.title ?? '',
        slug: data.slug ?? '',

        // Region / edition
        region: data.region ?? null,
        var_title: data.var_title ?? null,

        // Pricing
        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? 0,
        currency: data.currency ?? 'INR',

        // Classification
        platform: data.platform ?? null,
        category: data.category ?? null,
        subCategory: data.subCategory ?? null,
        workPlatform: data.workPlatform ?? null,
        item: data.item ?? 'DIGITAL KEY',
        item_type: data.item_type ?? 'GAME',

        // Product information
        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,
        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,
        editiondescription: data.editiondescription ?? null,
        age: data.age ?? null,

        // Requirements
        minimumRequirement: data.minimumRequirement ?? {
            os: null,
            processor: null,
            memory: null,
            graphics: null,
            storage: null,
            sound: null,
            additional_notes: null,
        },

        recommendedRequirement:
            data.recommendedRequirement ?? {
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

        // Images
        image: data.image ?? null,
        gallery: data.gallery ?? [],
        platform_image: data.platform_image ?? null,
        platform_icon_image:
            data.platform_icon_image ?? null,

        // Store settings
        status: data.status ?? 'draft',
        available: data.available ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isRecommended: data.isRecommended ?? false,
        psn: data.psn ?? false,
        rating: data.rating ?? 0,

        // Relations / SEO
        relatedProducts: data.relatedProducts ?? [],
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