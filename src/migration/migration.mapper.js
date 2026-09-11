'use strict';

function mapMediaImage(media) {
    if (!media) return null;

    return {
        url: media.url ?? null,
        thumbnail: media.formats?.thumbnail?.url ?? null,
        small: media.formats?.small?.url ?? null,
        medium: media.formats?.medium?.url ?? null,
        large: media.formats?.large?.url ?? null,
        width: media.width ?? null,
        height: media.height ?? null,
        alt: media.alternativeText ?? null,
    };
}

function mapProduct(product) {
    return {
        type: 'product',

        title: product.title ?? '',
        slug: product.slug ?? '',

        image: mapMediaImage(product.image),
        gallery: Array.isArray(product.gallery)
            ? product.gallery.map(mapMediaImage).filter(Boolean)
            : [],

        card_region: product.card_region ?? null,
        price: product.price ?? 0,
        discountPrice: product.discountPrice ?? 0,

        notice: product.notice ?? null,
        description: product.description ?? null,
        descriptionkey: product.descriptionkey ?? null,

        publisher: product.publisher ?? null,
        developer: product.developer ?? null,
        releaseDate: product.releaseDate ?? null,

        minimumRequirement: product.minimumRequirement ?? null,
        recommendedRequirement: product.recommendedRequirement ?? null,

        audio_language: product.audio_language ?? [],
        interface_language: product.interface_language ?? [],
        subtitles_language: product.subtitles_language ?? [],

        age: product.age ?? null,
        region: product.region ?? null,
        platform: product.platform ?? null,
        category: product.category ?? null,
        workPlatform: product.workPlatform ?? null,

        item: product.item ?? 'DIGITAL KEY',
        item_type: product.item_type ?? 'GAME',

        editiondescription: product.editiondescription ?? null,

        Available: product.Available ?? true,
        stock_stetus: product.stock_stetus ?? 'Availavle',

        isBestSeller: product.isBestSeller ?? false,
        isGiftCard: false,
        hideRecomend: product.hideRecomend ?? false,
        psn: product.psn ?? false,

        platformIcons: product.platformIcons ?? null,
        platform_image: product.platform_image ?? null,
        platform_icon_image: product.platform_icon_image ?? null,

        rating: product.rating ?? 0,

        relatedProducts: product.relatedProducts ?? [],
        relatedRegionProducts: product.relatedRegionProducts ?? [],

        var_title: product.var_title ?? null,
        seo: product.seo ?? null,
        Tags: product.Tags ?? [],

        createdAt: product.createdAt
            ? new Date(product.createdAt)
            : new Date(),

        updatedAt: product.updatedAt
            ? new Date(product.updatedAt)
            : new Date(),
    };
}

function mapGiftCard(giftCard) {
    return {
        type: 'gift-card',

        title: giftCard.title ?? '',
        slug: giftCard.slug ?? '',

        image: mapMediaImage(giftCard.image),
        gallery: Array.isArray(giftCard.gallery)
            ? giftCard.gallery.map(mapMediaImage).filter(Boolean)
            : [],

        card_region: giftCard.card_region ?? null,
        price: giftCard.price ?? 0,
        discountPrice: giftCard.discountPrice ?? 0,

        notice: giftCard.notice ?? null,
        description: giftCard.description ?? null,
        descriptionkey: giftCard.descriptionkey ?? null,

        publisher: giftCard.publisher ?? null,
        developer: giftCard.developer ?? null,
        releaseDate: giftCard.releaseDate ?? null,

        minimumRequirement: giftCard.minimumRequirement ?? null,
        recommendedRequirement: giftCard.recommendedRequirement ?? null,

        audio_language: giftCard.audio_language ?? [],
        interface_language: giftCard.interface_language ?? [],
        subtitles_language: giftCard.subtitles_language ?? [],

        age: giftCard.age ?? null,
        region: giftCard.region ?? null,
        platform: giftCard.platform ?? null,
        category: giftCard.category ?? null,
        workPlatform: giftCard.workPlatform ?? null,

        item: giftCard.item ?? 'DIGITAL KEY',
        item_type: giftCard.item_type ?? 'GIFT CARD',

        editiondescription: giftCard.editiondescription ?? null,

        Available: giftCard.Available ?? true,
        stock_stetus: giftCard.stock_stetus ?? 'Availavle',

        isBestSeller: giftCard.isBestSeller ?? false,
        isGiftCard: true,
        hideRecomend: giftCard.hideRecomend ?? false,
        psn: giftCard.psn ?? false,

        platformIcons: giftCard.platformIcons ?? null,
        platform_image: giftCard.platform_image ?? null,
        platform_icon_image: giftCard.platform_icon_image ?? null,

        rating: giftCard.rating ?? 0,

        relatedProducts: giftCard.relatedProducts ?? [],
        relatedRegionProducts: giftCard.relatedRegionProducts ?? [],

        var_title: giftCard.var_title ?? null,
        seo: giftCard.seo ?? null,
        Tags: giftCard.Tags ?? [],

        createdAt: giftCard.createdAt
            ? new Date(giftCard.createdAt)
            : new Date(),

        updatedAt: giftCard.updatedAt
            ? new Date(giftCard.updatedAt)
            : new Date(),
    };
}

function mapGameKey(gameKey, productIdMap, giftCardIdMap) {
    let productId = null;
    let giftCardId = null;

    if (gameKey.product?.id) {
        productId = productIdMap.get(gameKey.product.id) ?? null;
    }

    if (gameKey.giftCard?.id) {
        giftCardId = giftCardIdMap.get(gameKey.giftCard.id) ?? null;
    }

    return {
        code: gameKey.code ?? '',

        productId,
        giftCardId,

        isAvailable: gameKey.isAvailable ?? true,

        uploadedAt: gameKey.uploadedAt ?? null,
        assignedAt: gameKey.assignedAt ?? null,
        soldAt: gameKey.soldAt ?? null,

        batchId: gameKey.batchId ?? null,
        notes: gameKey.notes ?? null,

        createdAt: gameKey.createdAt
            ? new Date(gameKey.createdAt)
            : new Date(),

        updatedAt: gameKey.updatedAt
            ? new Date(gameKey.updatedAt)
            : new Date(),
    };
}

module.exports = {
    mapProduct,
    mapGiftCard,
    mapGameKey,
};