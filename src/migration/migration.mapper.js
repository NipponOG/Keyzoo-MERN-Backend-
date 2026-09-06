'use strict';

function mapProduct(product) {
    return {
        legacyId: product.id,
        legacyDocumentId: product.documentId,

        type: 'product',

        title: product.title ?? '',
        slug: product.slug ?? '',

        card_region: product.card_region ?? null,

        price: product.price ?? null,
        discountPrice: product.discountPrice ?? null,

        notice: product.notice ?? null,
        description: product.description ?? null,
        descriptionkey: product.descriptionkey ?? null,

        publisher: product.publisher ?? null,
        developer: product.developer ?? null,
        releaseDate: product.releaseDate ?? null,

        region: product.region ?? null,
        workPlatform: product.workPlatform ?? null,

        item: product.item ?? null,
        editiondescription: product.editiondescription ?? null,

        Available: product.Available ?? false,

        var_title: product.var_title ?? null,
        isBestSeller: product.isBestSeller ?? false,
        isGiftCard: false,

        hideRecomend: product.hideRecomend ?? false,
        psn: product.psn ?? false,

        platformIcons: product.platformIcons ?? null,
        platform_image: product.platform_image ?? null,

        rating: product.rating ?? 0,

        platform: product.platform ?? null,
        category: product.category ?? null,

        item_type: product.item_type ?? null,

        lowStockAlertSent: product.lowStockAlertSent ?? false,

        locale: product.locale ?? 'en',

        publishedAt: product.publishedAt ?? null,

        legacyCreatedAt: product.createdAt ?? null,
        legacyUpdatedAt: product.updatedAt ?? null,

        createdAt: product.createdAt
            ? new Date(product.createdAt)
            : new Date(),

        updatedAt: product.updatedAt
            ? new Date(product.updatedAt)
            : new Date(),

        migratedAt: new Date(),
    };
}

function mapGiftCard(giftCard) {
    return {
        legacyId: giftCard.id,
        legacyDocumentId: giftCard.documentId,

        type: 'gift-card',

        title: giftCard.title ?? '',
        slug: giftCard.slug ?? '',

        card_region: giftCard.card_region ?? null,

        price: giftCard.price ?? null,
        discountPrice: giftCard.discountPrice ?? null,

        notice: giftCard.notice ?? null,
        description: giftCard.description ?? null,
        descriptionkey: giftCard.descriptionkey ?? null,

        publisher: giftCard.publisher ?? null,
        developer: giftCard.developer ?? null,
        releaseDate: giftCard.releaseDate ?? null,

        region: giftCard.region ?? null,
        workPlatform: giftCard.workPlatform ?? null,

        item: giftCard.item ?? null,
        item_type: giftCard.item_type ?? 'GIFT CARD',

        editiondescription: giftCard.editiondescription ?? null,

        Available: giftCard.Available ?? false,

        var_title: giftCard.var_title ?? null,

        isBestSeller: giftCard.isBestSeller ?? false,
        isGiftCard: true,

        hideRecomend: giftCard.hideRecomend ?? false,
        psn: giftCard.psn ?? false,

        platformIcons: giftCard.platformIcons ?? null,
        platform_image: giftCard.platform_image ?? null,

        rating: giftCard.rating ?? 0,

        platform: giftCard.platform ?? null,
        category: giftCard.category ?? 'gift-card',

        lowStockAlertSent: giftCard.lowStockAlertSent ?? false,

        locale: giftCard.locale ?? 'en',

        publishedAt: giftCard.publishedAt ?? null,

        legacyCreatedAt: giftCard.createdAt ?? null,
        legacyUpdatedAt: giftCard.updatedAt ?? null,

        createdAt: giftCard.createdAt
            ? new Date(giftCard.createdAt)
            : new Date(),

        updatedAt: giftCard.updatedAt
            ? new Date(giftCard.updatedAt)
            : new Date(),

        migratedAt: new Date(),
    };
}

function mapGameKey(gameKey) {
    let ownerType = null;
    let ownerId = null;

    if (gameKey.product) {
        ownerType = 'product';
        ownerId = gameKey.product.id;
    }

    if (gameKey.giftCard) {
        ownerType = 'gift-card';
        ownerId = gameKey.giftCard.id;
    }

    return {
        legacyId: gameKey.id,
        legacyDocumentId: gameKey.documentId,

        code: gameKey.code,

        ownerType,
        ownerId,

        isAvailable: gameKey.isAvailable ?? true,

        uploadedAt: gameKey.uploadedAt ?? null,
        assignedAt: gameKey.assignedAt ?? null,
        soldAt: gameKey.soldAt ?? null,

        batchId: gameKey.batchId ?? null,
        notes: gameKey.notes ?? null,

        legacyCreatedAt: gameKey.createdAt ?? null,
        legacyUpdatedAt: gameKey.updatedAt ?? null,

        createdAt: gameKey.createdAt
            ? new Date(gameKey.createdAt)
            : new Date(),

        updatedAt: gameKey.updatedAt
            ? new Date(gameKey.updatedAt)
            : new Date(),

        migratedAt: new Date(),
    };
}

module.exports = {
    mapProduct,
    mapGiftCard,
    mapGameKey,
};