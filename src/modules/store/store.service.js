
'use strict';

const storeRepository = require('./store.repository');

async function getStoreFilterOptions() {
    const [products, giftCards] = await Promise.all([
        storeRepository.findPublishedProducts(),
        storeRepository.findPublishedGiftCards(),
    ]);

    const items = [...products, ...giftCards];

    const uniqueValues = (values) => [
        ...new Set(
            values
                .filter((value) => value !== null && value !== undefined && value !== '')
                .map((value) => String(value).trim())
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b));

    return {
        platforms: uniqueValues(items.map((item) => item.platform)),
        regions: uniqueValues(items.map((item) => item.card_region || item.region)),
        productTypes: uniqueValues(items.map((item) => item.item_type)),
        worksOn: uniqueValues(items.map((item) => item.workPlatform || item.work_platform)),
        counts: {
            platforms: items.reduce((acc, item) => {
                const value = item.platform;
                if (value) acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {}),
            regions: items.reduce((acc, item) => {
                const value = item.card_region || item.region;
                if (value) acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {}),
            productTypes: items.reduce((acc, item) => {
                const value = item.item_type;
                if (value) acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {}),
            worksOn: items.reduce((acc, item) => {
                const value = item.workPlatform || item.work_platform;
                if (value) acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {}),
        },
    };
}

async function getStoreItems(query = {}) {
    const [products, giftCards] = await Promise.all([
        storeRepository.findPublishedProducts(),
        storeRepository.findPublishedGiftCards(),
    ]);

    const normalizedProducts = products.map((product) => ({
        ...product,
        id: product._id.toString(),
        type: 'product',
    }));

    const normalizedGiftCards = giftCards.map((giftCard) => ({
        ...giftCard,
        id: giftCard._id.toString(),
        type: 'gift-card',
    }));

    let items = [...normalizedProducts, ...normalizedGiftCards];

    // SEARCH
    if (query.search) {
        const search = String(query.search).trim().toLowerCase();

        items = items.filter((item) =>
            [item.title, item.slug, item.platform, item.publisher, item.developer]
                .some((value) =>
                    String(value || '').toLowerCase().includes(search)
                )
        );
    }

    // PLATFORM
    if (query.platform) {
        const selected = String(query.platform)
            .split(',')
            .map((value) => value.trim().toLowerCase());

        items = items.filter((item) =>
            selected.includes(String(item.platform || '').toLowerCase())
        );
    }

    // REGION
    if (query.region) {
        const selected = String(query.region)
            .split(',')
            .map((value) => value.trim().toLowerCase());

        items = items.filter((item) =>
            selected.includes(
                String(item.card_region || item.region || '').toLowerCase()
            )
        );
    }

    // PRODUCT TYPE
    if (query.productType) {
        const selected = String(query.productType)
            .split(',')
            .map((value) => value.trim().toLowerCase());

        items = items.filter((item) =>
            selected.includes(String(item.item_type || '').toLowerCase())
        );
    }

    // WORKS ON
    if (query.worksOn) {
        const selected = String(query.worksOn)
            .split(',')
            .map((value) => value.trim().toLowerCase());

        items = items.filter((item) =>
            selected.includes(
                String(item.workPlatform || item.work_platform || '').toLowerCase()
            )
        );
    }

    // AVAILABILITY
    if (String(query.available).toLowerCase() === 'true') {
        items = items.filter((item) => item.available ?? item.Available ?? false);
    }

    // PRICE
    if (query.minPrice !== undefined && query.minPrice !== '') {
        const minPrice = Number(query.minPrice);

        if (Number.isFinite(minPrice)) {
            items = items.filter((item) =>
                Number(item.discountPrice ?? item.price ?? 0) >= minPrice
            );
        }
    }

    if (query.maxPrice !== undefined && query.maxPrice !== '') {
        const maxPrice = Number(query.maxPrice);

        if (Number.isFinite(maxPrice)) {
            items = items.filter((item) =>
                Number(item.discountPrice ?? item.price ?? 0) <= maxPrice
            );
        }
    }

    // PAGINATION
    const requestedPage = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const requestedPageSize = Number.parseInt(query.pageSize, 10) || 10;
    const pageSize = Math.min(100, Math.max(1, requestedPageSize));

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const startIndex = (page - 1) * pageSize;

    return {
        data: items.slice(startIndex, startIndex + pageSize),
        total,
        page,
        pageSize,
        totalPages,
    };
}

module.exports = {
    getStoreItems,
    getStoreFilterOptions,
};
