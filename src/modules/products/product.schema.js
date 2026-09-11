
'use strict';

/**
 * Product document factory
 * This is NOT a MongoDB schema.
 * It creates a consistent product object before saving.
 */

function createProductDocument(data = {}) {
    const now = new Date();

    return {
        // legacyId: data.legacyId ?? null,
        type: 'product',

        title: data.title ?? '',
        slug: data.slug ?? '',

        image: data.image ?? null,
        gallery: data.gallery ?? [],

        card_region: data.card_region ?? null,

        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? 0,

        notice: data.notice ?? null,
        description: data.description ?? null,
        descriptionkey: data.descriptionkey ?? null,

        publisher: data.publisher ?? null,
        developer: data.developer ?? null,
        releaseDate: data.releaseDate ?? null,

        minimumRequirement: data.minimumRequirement ?? null,
        recommendedRequirement: data.recommendedRequirement ?? null,

        audio_language: data.audio_language ?? [],
        interface_language: data.interface_language ?? [],
        subtitles_language: data.subtitles_language ?? [],

        age: data.age ?? null,

        region: data.region ?? null,
        platform: data.platform ?? null,
        category: data.category ?? null,
        workPlatform: data.workPlatform ?? null,

        item: data.item ?? 'DIGITAL KEY',
        item_type: data.item_type ?? 'GAME',

        editiondescription: data.editiondescription ?? null,

        Available: data.Available ?? true,
        stock_stetus: data.stock_stetus ?? 'Availavle',

        isBestSeller: data.isBestSeller ?? false,
        isGiftCard: false,

        hideRecomend: data.hideRecomend ?? false,
        psn: data.psn ?? false,

        platformIcons: data.platformIcons ?? null,
        platform_image: data.platform_image ?? null,
        platform_icon_image: data.platform_icon_image ?? null,

        rating: data.rating ?? 0,

        relatedProducts: data.relatedProducts ?? [],
        relatedRegionProducts: data.relatedRegionProducts ?? [],

        var_title: data.var_title ?? null,

        seo: data.seo ?? null,
        Tags: data.Tags ?? [],

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createProductDocument,
};