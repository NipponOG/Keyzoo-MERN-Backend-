'use strict';

const repository = require('./inventory.repository');

function getStatus(availableKeys) {
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
                productCounts.get(product._id.toString())
            );

            const counts =
                productCounts.get(
                    product._id.toString()
                ) || {
                    totalKeys: 0,
                    availableKeys: 0,
                    soldKeys: 0,
                };

            return {
                ...product,
                totalKeys: counts.totalKeys,
                availableKeys: counts.availableKeys,
                soldKeys: counts.soldKeys,
                status: getStatus(
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

            return {
                ...giftCard,
                totalKeys: counts.totalKeys,
                availableKeys: counts.availableKeys,
                soldKeys: counts.soldKeys,
                status: getStatus(
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
        (sum, item) => sum + item.totalKeys,
        0
    );

    const lowStock = inventoryProducts.filter(
        (item) => item.status === 'Low Stock'
    ).length;

    const outOfStock = inventoryProducts.filter(
        (item) => item.status === 'Out of Stock'
    ).length;

    return {
        totalProducts,
        totalKeys,
        lowStock,
        outOfStock,
        products: inventoryProducts,
    };
}

module.exports = {
    getInventory,
};