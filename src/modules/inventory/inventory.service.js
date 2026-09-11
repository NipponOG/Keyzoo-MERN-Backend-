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

    const productCounts = new Map();
    const giftCardCounts = new Map();

    for (const item of gameKeyCounts) {
        const {
            productId,
            giftCardId,
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

    return [
        ...productInventory,
        ...giftCardInventory,
    ];
}

module.exports = {
    getInventory,
};