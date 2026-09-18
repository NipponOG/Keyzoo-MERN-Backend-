'use strict';

function createCategoryBannerDocument(data = {}) {
    const now = new Date();

    return {
        type: 'category-banner',

        title: data.title ?? '',

        desktopImage: data.desktopImage ?? null,
        mobileImage: data.mobileImage ?? null,

        link: data.link ?? null,

        status: data.status ?? 'draft',
        sortOrder: data.sortOrder ?? 0,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createCategoryBannerDocument,
};