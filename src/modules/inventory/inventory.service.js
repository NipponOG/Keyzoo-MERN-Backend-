'use strict';

const repository = require('./inventory.repository');

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
    const [
        products,
        giftCards,
        gameKeyCounts,
    ] = await Promise.all([
        repository.getProducts(),
        repository.getGiftCards(),
        repository.getGameKeyCounts(),
    ]);

    console.log("========== INVENTORY DEBUG ==========");
    console.log("Products:", products.length);
    console.log("Gift Cards:", giftCards.length);
    console.log("Game Key Counts:", gameKeyCounts);
    console.log("=====================================");

    const productCounts = new Map();
    const giftCardCounts = new Map();

    for (const item of gameKeyCounts) {
        const {
            productId,
            giftCardId,
        } = item._id;

        const {
            totalKeys,
            availableKeys,
        } = item;

        if (productId) {
            productCounts.set(
                productId.toString(),
                {
                    totalKeys,
                    availableKeys,
                    soldKeys:
                        totalKeys - availableKeys,
                }
            );
        }

        if (giftCardId) {
            giftCardCounts.set(
                giftCardId.toString(),
                {
                    totalKeys,
                    availableKeys,
                    soldKeys:
                        totalKeys - availableKeys,
                }
            );
        }
    }

    const productInventory = products.map(
        (product) => {

            console.log(
                "PRODUCT:",
                product._id.toString(),
                product.title
            );

            console.log(
                "MATCHING COUNTS:",
                productCounts.get(
                    product._id.toString()
                )
            );

            const counts =
                productCounts.get(
                    product._id.toString()
                ) || {
                    totalKeys: 0,
                    availableKeys: 0,
                    soldKeys: 0,
                };

            const isAvailable =
                product.available === true &&
                counts.availableKeys > 0;

            return {
                ...product,

                totalKeys: counts.totalKeys,
                availableKeys: counts.availableKeys,
                soldKeys: counts.soldKeys,

                available: isAvailable,

                // Keep product visibility status untouched.
                status: product.status ?? 'draft',

                // Inventory status gets its own field.
                stockStatus: getStockStatus(
                    counts.availableKeys
                ),
            };
        }
    );

    const giftCardInventory =
        giftCards.map((giftCard) => {

            const counts =
                giftCardCounts.get(
                    giftCard._id.toString()
                ) || {
                    totalKeys: 0,
                    availableKeys: 0,
                    soldKeys: 0,
                };

            const isAvailable =
                giftCard.available === true &&
                counts.availableKeys > 0;

            return {
                ...giftCard,

                totalKeys: counts.totalKeys,
                availableKeys: counts.availableKeys,
                soldKeys: counts.soldKeys,

                available: isAvailable,

                // Keep gift-card visibility status untouched.
                status: giftCard.status ?? 'draft',

                // Inventory status gets its own field.
                stockStatus: getStockStatus(
                    counts.availableKeys
                ),
            };
        });

    const inventoryProducts = [
        ...productInventory,
        ...giftCardInventory,
    ];

    const totalProducts = inventoryProducts.length;

    const totalKeys = inventoryProducts.reduce(
        (sum, item) =>
            sum + item.totalKeys,
        0
    );

    const lowStock =
        inventoryProducts.filter(
            (item) =>
                item.stockStatus === 'Low Stock'
        ).length;

    const outOfStock =
        inventoryProducts.filter(
            (item) =>
                item.stockStatus === 'Out of Stock'
        ).length;

    return {
        totalProducts,
        totalKeys,
        lowStock,
        outOfStock,
        products: inventoryProducts,
    };
}

async function bulkDeleteItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No items selected for deletion.');
    }

    const allowedTypes = ['product', 'gift-card'];

    for (const item of items) {
        if (!item || !item.id || !allowedTypes.includes(item.type)) {
            throw new Error('Invalid bulk delete item.');
        }
    }

    return repository.bulkDeleteItems(items);
}

module.exports = {
    getInventory,
    bulkDeleteItems,
};