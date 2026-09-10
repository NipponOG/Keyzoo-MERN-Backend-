'use strict';

const inventoryRepository = require('./inventory.repository');

function getStockStatus(availableKeys) {
    if (availableKeys === 0) {
        return 'Out of Stock';
    }

    if (availableKeys <= 5) {
        return 'Low Stock';
    }

    return 'Healthy';
}

async function getInventory() {
    const {
        products,
        giftCards,
        keyCounts,
    } = await inventoryRepository.getInventoryData();

    const keyCountMap = new Map();

    for (const item of keyCounts) {
        const ownerType = item._id?.ownerType;
        const ownerId = Number(item._id?.ownerId);

        if (!ownerType || Number.isNaN(ownerId)) {
            continue;
        }

        keyCountMap.set(
            `${ownerType}:${ownerId}`,
            {
                totalKeys: item.totalKeys || 0,
                availableKeys: item.availableKeys || 0,
            }
        );
    }

    const allItems = [
        ...products,
        ...giftCards,
    ];

    const inventoryProducts = allItems.map((item) => {
        const ownerType =
            item.type === 'gift-card'
                ? 'gift-card'
                : 'product';

        const ownerId = Number(item.legacyId);

        const counts =
            keyCountMap.get(`${ownerType}:${ownerId}`) || {
                totalKeys: 0,
                availableKeys: 0,
            };

        const totalKeys = counts.totalKeys;
        const availableKeys = counts.availableKeys;
        const soldKeys = totalKeys - availableKeys;

        return {
            id: item.legacyId,
            title: item.title || '',
            type: item.type || ownerType,
            image: item.image || null,
            region: item.region || null,
            card_region: item.card_region || null,
            workPlatform: item.workPlatform || null,
            item: item.item || null,

            availableKeys,
            soldKeys,
            totalKeys,

            status: getStockStatus(availableKeys),
        };
    });

    let totalKeys = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of inventoryProducts) {
        totalKeys += product.totalKeys;

        if (product.status === 'Low Stock') {
            lowStock++;
        }

        if (product.status === 'Out of Stock') {
            outOfStock++;
        }
    }

    return {
        totalProducts: inventoryProducts.length,
        totalKeys,
        lowStock,
        outOfStock,
        products: inventoryProducts,
    };
}

module.exports = {
    getInventory,
};