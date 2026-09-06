'use strict';

const { fetchAll } = require('./strapi.client');

function validateCollection(name, items) {
    console.log(`\n================================`);
    console.log(`${name} validation`);
    console.log(`================================`);

    const ids = new Map();
    const documentIds = new Map();
    const slugs = new Map();

    const problems = [];

    for (const item of items) {
        // ID
        if (item.id !== undefined && item.id !== null) {
            if (ids.has(item.id)) {
                problems.push(
                    `Duplicate id ${item.id}: ${ids.get(item.id)} and ${item.title}`
                );
            } else {
                ids.set(item.id, item.title);
            }
        } else {
            problems.push(`Missing id: ${item.title || '(no title)'}`);
        }

        // documentId
        if (item.documentId) {
            if (documentIds.has(item.documentId)) {
                problems.push(
                    `Duplicate documentId ${item.documentId}: ${documentIds.get(item.documentId)} and ${item.title}`
                );
            } else {
                documentIds.set(item.documentId, item.title);
            }
        } else {
            problems.push(
                `Missing documentId: ${item.title || `(id ${item.id})`}`
            );
        }

        // slug
        if (item.slug) {
            if (slugs.has(item.slug)) {
                problems.push(
                    `Duplicate slug "${item.slug}": ${slugs.get(item.slug)} and ${item.title}`
                );
            } else {
                slugs.set(item.slug, item.title);
            }
        } else {
            problems.push(
                `Missing slug: ${item.title || `(id ${item.id})`}`
            );
        }

        // title
        if (!item.title) {
            problems.push(
                `Missing title: id ${item.id}`
            );
        }

        // Product-specific checks
        if (name === 'Products') {
            if (item.type !== 'product') {
                problems.push(
                    `Product id ${item.id} has unexpected type: ${item.type}`
                );
            }

            if (item.price !== null && typeof item.price !== 'number') {
                problems.push(
                    `Product id ${item.id} has invalid price: ${item.price}`
                );
            }

            if (
                item.discountPrice !== null &&
                typeof item.discountPrice !== 'number'
            ) {
                problems.push(
                    `Product id ${item.id} has invalid discountPrice: ${item.discountPrice}`
                );
            }
        }

        // Gift Card-specific checks
        if (name === 'Gift Cards') {
            if (
                item.type !== null &&
                item.type !== 'gift-card'
            ) {
                problems.push(
                    `Gift Card id ${item.id} has unexpected type: ${item.type}`
                );
            }

            if (item.category !== 'gift-card') {
                problems.push(
                    `Gift Card id ${item.id} has unexpected category: ${item.category}`
                );
            }
        }
    }

    console.log(`Records checked: ${items.length}`);

    if (problems.length === 0) {
        console.log('✅ No validation problems found');
    } else {
        console.log(`⚠️ Problems found: ${problems.length}`);

        for (const problem of problems) {
            console.log(`- ${problem}`);
        }
    }

    return problems;
}

async function inspect() {
    try {
        console.log('\n🔎 Keyzoo migration inspection');
        console.log('================================\n');

        console.log('Reading Products...');
        const products = await fetchAll('products');

        console.log('Reading Gift Cards...');
        const giftCards = await fetchAll('gift-cards');

        console.log('Reading Game Keys...');
        const gameKeys = await fetchAll('game-keys');

        validateCollection('Products', products);
        validateCollection('Gift Cards', giftCards);

        console.log('\n================================');
        console.log('Game Key relationship validation');
        console.log('================================');

        const productIds = new Set(
            products.map((product) => product.id)
        );

        const giftCardIds = new Set(
            giftCards.map((giftCard) => giftCard.id)
        );

        const gameKeyIds = new Set();
        const gameKeyCodes = new Set();

        let gameKeyProblems = 0;

        for (const gameKey of gameKeys) {
            const hasProduct = !!gameKey.product;
            const hasGiftCard = !!gameKey.giftCard;

            // Check duplicate Game Key ID
            if (gameKeyIds.has(gameKey.id)) {
                console.log(
                    `⚠️ Duplicate Game Key id: ${gameKey.id}`
                );

                gameKeyProblems++;
            } else {
                gameKeyIds.add(gameKey.id);
            }

            // Check duplicate Game Key code
            if (gameKey.code) {
                if (gameKeyCodes.has(gameKey.code)) {
                    console.log(
                        `⚠️ Duplicate Game Key code: ${gameKey.code}`
                    );

                    gameKeyProblems++;
                } else {
                    gameKeyCodes.add(gameKey.code);
                }
            } else {
                console.log(
                    `⚠️ Game Key ${gameKey.id} has no code`
                );

                gameKeyProblems++;
            }

            // Game Key must have exactly one owner
            if (hasProduct && hasGiftCard) {
                console.log(
                    `⚠️ Game Key ${gameKey.id} belongs to BOTH a Product and Gift Card`
                );

                gameKeyProblems++;

                continue;
            }

            if (!hasProduct && !hasGiftCard) {
                console.log(
                    `⚠️ Game Key ${gameKey.id} has no Product or Gift Card`
                );

                gameKeyProblems++;

                continue;
            }

            // Validate Product owner exists
            if (hasProduct) {
                const productId = gameKey.product.id;

                if (!productIds.has(productId)) {
                    console.log(
                        `⚠️ Game Key ${gameKey.id} references missing Product ${productId}`
                    );

                    gameKeyProblems++;
                }
            }

            // Validate Gift Card owner exists
            if (hasGiftCard) {
                const giftCardId = gameKey.giftCard.id;

                if (!giftCardIds.has(giftCardId)) {
                    console.log(
                        `⚠️ Game Key ${gameKey.id} references missing Gift Card ${giftCardId}`
                    );

                    gameKeyProblems++;
                }
            }
        }

        console.log(`Game Keys checked: ${gameKeys.length}`);

        if (gameKeyProblems === 0) {
            console.log('✅ All Game Key ownership checks passed');
            console.log('✅ No duplicate Game Key IDs');
            console.log('✅ No duplicate Game Key codes');
            console.log('✅ All referenced Products and Gift Cards exist');
        } else {
            console.log(
                `⚠️ Game Key problems: ${gameKeyProblems}`
            );
        }

        console.log('\n================================');
        console.log('Migration source summary');
        console.log('================================');

        console.log(`Products:   ${products.length}`);
        console.log(`Gift Cards: ${giftCards.length}`);
        console.log(`Game Keys:  ${gameKeys.length}`);

        console.log('\n================================');
        console.log('Product sample');
        console.log('================================');

        if (products.length > 0) {
            console.dir(products[0], {
                depth: null,
                colors: true,
            });
        } else {
            console.log('No products found.');
        }

        console.log('\n================================');
        console.log('Gift Card sample');
        console.log('================================');

        if (giftCards.length > 0) {
            console.dir(giftCards[0], {
                depth: null,
                colors: true,
            });
        } else {
            console.log('No gift cards found.');
        }

        console.log('\n================================');
        console.log('Game Key samples');
        console.log('================================');

        if (gameKeys.length > 0) {
            gameKeys.slice(0, 10).forEach((gameKey, index) => {
                console.log(`\n--- Game Key ${index + 1} ---`);

                console.dir(
                    {
                        id: gameKey.id,
                        documentId: gameKey.documentId,
                        code: gameKey.code,
                        isAvailable: gameKey.isAvailable,
                        assignedAt: gameKey.assignedAt,
                        uploadedAt: gameKey.uploadedAt,
                        soldAt: gameKey.soldAt,
                        batchId: gameKey.batchId,
                        notes: gameKey.notes,

                        product: gameKey.product,
                        giftCard: gameKey.giftCard,
                    },
                    {
                        depth: null,
                        colors: true,
                    }
                );
            });
        } else {
            console.log('No game keys found.');
        }

        console.log('\n✅ Read-only inspection completed');
    } catch (error) {
        console.error('\n❌ Migration inspection failed');
        console.error(error);
        process.exitCode = 1;
    }
}

inspect();