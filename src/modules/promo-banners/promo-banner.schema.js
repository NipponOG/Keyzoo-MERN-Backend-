'use strict';

function createPromoBannerDocument(data = {}) {
    const now = new Date();

    return {
        type: 'promo-banner',

        title: data.title ?? '',
        image: data.image ?? null,
        link: data.link ?? null,

        status: data.status ?? 'draft',
        sortOrder: data.sortOrder ?? 0,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createPromoBannerDocument,
};