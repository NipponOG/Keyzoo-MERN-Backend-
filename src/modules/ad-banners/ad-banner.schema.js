'use strict';

function createAdBannerDocument(data = {}) {
    const now = new Date();

    return {
        title: data.title ?? '',
        description: data.description ?? null,

        image: data.image ?? null,
        thumbnail: data.thumbnail ?? null,
        trailer: data.trailer ?? null,
        logo: data.logo ?? null,

        productId: data.productId ?? null,

        youtubeVideoId: data.youtubeVideoId ?? null,

        status: data.status ?? 'draft',

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createAdBannerDocument,
};