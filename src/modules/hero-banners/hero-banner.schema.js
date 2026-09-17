'use strict';

/**
 * Creates a clean homepage hero banner document.
 */
function createHeroBannerDocument(data = {}) {
    const now = new Date();

    return {
        type: 'hero-banner',

        title: data.title ?? '',

        // Cloudinary URL
        image: data.image ?? null,

        // Optional destination when banner is clicked
        link: data.link ?? null,

        // Only published banners are shown on storefront
        status: data.status ?? 'draft',

        // Controls banner order
        sortOrder: data.sortOrder ?? 0,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createHeroBannerDocument,
};