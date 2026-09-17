'use strict';

function createGameBannerDocument(data = {}) {
    const now = new Date();

    return {
        type: 'game-banner',
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
    createGameBannerDocument,
};