'use strict';

const { fetchAll } = require('./strapi.client');
const {
    mapProduct,
    mapGiftCard,
    mapGameKey,
} = require('./migration.mapper');

const {
    connectDatabase,
    getDatabase,
    closeDatabase,
} = require('../config/database');

function validateMigrationData(products, giftCards, gameKeys) {
    const problems = [];

    const productIds = new Set(
        products.map((product) => product.id)
    );

    const giftCardIds = new Set(
        giftCards.map((giftCard) => giftCard.id)
    );

    const gameKeyIds = new Set();
    const gameKeyCodes = new Set();

    // --------------------------------------------
    // Validate Products
    // --------------------------------------------

    for (const product of products) {
        if (product.id === undefined || product.id === null) {
            problems.push(
                'Product is missing id'
            );
        }

        if (!product.documentId) {
            problems.push(
                `Product ${product.id} is missing documentId`
            );
        }

        if (!product.slug) {
            problems.push(
                `Product ${product.id} is missing slug`
            );
        }

        if (!product.title) {
            problems.push(
                `Product ${product.id} is missing title`
            );
        }
    }

    // --------------------------------------------
    // Validate Gift Cards
    // --------------------------------------------

    for (const giftCard of giftCards) {
        if (giftCard.id === undefined || giftCard.id === null) {
            problems.push(
                'Gift Card is missing id'
            );
        }

        if (!giftCard.documentId) {
            problems.push(
                `Gift Card ${giftCard.id} is missing documentId`
            );
        }

        if (!giftCard.slug) {
            problems.push(
                `Gift Card ${giftCard.id} is missing slug`
            );
        }

        if (!giftCard.title) {
            problems.push(
                `Gift Card ${giftCard.id} is missing title`
            );
        }
    }

    // --------------------------------------------
    // Validate Game Keys
    // --------------------------------------------

    for (const gameKey of gameKeys) {
        const hasProduct = !!gameKey.product;
        const hasGiftCard = !!gameKey.giftCard;

        // ID
        if (gameKey.id === undefined || gameKey.id === null) {
            problems.push(
                'Game Key is missing id'
            );
        } else if (gameKeyIds.has(gameKey.id)) {
            problems.push(
                `Duplicate Game Key id ${gameKey.id}`
            );
        } else {
            gameKeyIds.add(gameKey.id);
        }

        // Code
        if (!gameKey.code) {
            problems.push(
                `Game Key ${gameKey.id} is missing code`
            );
        } else if (gameKeyCodes.has(gameKey.code)) {
            problems.push(
                `Duplicate Game Key code "${gameKey.code}"`
            );
        } else {
            gameKeyCodes.add(gameKey.code);
        }

        // Exactly one owner
        if (hasProduct && hasGiftCard) {
            problems.push(
                `Game Key ${gameKey.id} belongs to both Product and Gift Card`
            );

            continue;
        }

        if (!hasProduct && !hasGiftCard) {
            problems.push(
                `Game Key ${gameKey.id} has no Product or Gift Card owner`
            );

            continue;
        }

        // Product owner exists
        if (hasProduct) {
            const productId = gameKey.product.id;

            if (!productIds.has(productId)) {
                problems.push(
                    `Game Key ${gameKey.id} references missing Product ${productId}`
                );
            }
        }

        // Gift Card owner exists
        if (hasGiftCard) {
            const giftCardId = gameKey.giftCard.id;

            if (!giftCardIds.has(giftCardId)) {
                problems.push(
                    `Game Key ${gameKey.id} references missing Gift Card ${giftCardId}`
                );
            }
        }
    }

    return problems;
}

async function migrate() {
    try {
        console.log('\n🚀 Keyzoo MongoDB migration');
        console.log('====================================\n');

        // Connect to MongoDB
        await connectDatabase();

        const db = getDatabase();

        // Read source data from Strapi
        console.log('Reading Products...');
        const products = await fetchAll('products');

        console.log('Reading Gift Cards...');
        const giftCards = await fetchAll('gift-cards');

        console.log('Reading Game Keys...');
        const gameKeys = await fetchAll('game-keys');

        console.log('\nSource records');
        console.log('----------------');
        console.log(`Products:   ${products.length}`);
        console.log(`Gift Cards: ${giftCards.length}`);
        console.log(`Game Keys:  ${gameKeys.length}`);

        const validationProblems = validateMigrationData(
            products,
            giftCards,
            gameKeys
        );

        console.log('\n====================================');
        console.log('Pre-migration validation');
        console.log('====================================');

        if (validationProblems.length > 0) {
            console.error(
                `❌ Migration stopped. ${validationProblems.length} problem(s) found:`
            );

            for (const problem of validationProblems) {
                console.error(`- ${problem}`);
            }

            console.error('\n❌ No MongoDB data was written.');

            return;
        }

        console.log('✅ Products validated');
        console.log('✅ Gift Cards validated');
        console.log('✅ Game Keys validated');
        console.log('✅ Game Key ownership validated');
        console.log('✅ No duplicate Game Key IDs');
        console.log('✅ No duplicate Game Key codes');
        console.log('✅ All Game Key owners exist');

        // Map source records
        const mappedProducts = products.map(mapProduct);
        const mappedGiftCards = giftCards.map(mapGiftCard);
        const mappedGameKeys = gameKeys.map(mapGameKey);

        // MongoDB collections
        const productCollection = db.collection('products');
        const giftCardCollection = db.collection('gift_cards');
        const gameKeyCollection = db.collection('game_keys');

        // Create indexes
        console.log('\nCreating indexes...');

        await productCollection.createIndex(
            { legacyId: 1 },
            { unique: true }
        );

        await productCollection.createIndex(
            { slug: 1 },
            { unique: true }
        );

        await giftCardCollection.createIndex(
            { legacyId: 1 },
            { unique: true }
        );

        await giftCardCollection.createIndex(
            { slug: 1 },
            { unique: true }
        );

        await gameKeyCollection.createIndex(
            { legacyId: 1 },
            { unique: true }
        );

        await gameKeyCollection.createIndex(
            { code: 1 },
            { unique: true }
        );

        console.log('✅ Indexes ready');

        // --------------------------------------------------
        // Products
        // --------------------------------------------------

        console.log('\nMigrating Products...');

        if (mappedProducts.length > 0) {
            const productOperations = mappedProducts.map((product) => ({
                updateOne: {
                    filter: {
                        legacyId: product.legacyId,
                    },
                    update: {
                        $set: product,
                    },
                    upsert: true,
                },
            }));

            const result = await productCollection.bulkWrite(
                productOperations,
                { ordered: false }
            );

            console.log(
                `✅ Products migrated: ${result.upsertedCount + result.modifiedCount}`
            );
        } else {
            console.log('No Products to migrate.');
        }

        // --------------------------------------------------
        // Gift Cards
        // --------------------------------------------------

        console.log('\nMigrating Gift Cards...');

        if (mappedGiftCards.length > 0) {
            const giftCardOperations = mappedGiftCards.map((giftCard) => ({
                updateOne: {
                    filter: {
                        legacyId: giftCard.legacyId,
                    },
                    update: {
                        $set: giftCard,
                    },
                    upsert: true,
                },
            }));

            const result = await giftCardCollection.bulkWrite(
                giftCardOperations,
                { ordered: false }
            );

            console.log(
                `✅ Gift Cards migrated: ${result.upsertedCount + result.modifiedCount}`
            );
        } else {
            console.log('No Gift Cards to migrate.');
        }

        // --------------------------------------------------
        // Game Keys
        // --------------------------------------------------

        console.log('\nMigrating Game Keys...');

        if (mappedGameKeys.length > 0) {
            const gameKeyOperations = mappedGameKeys.map((gameKey) => ({
                updateOne: {
                    filter: {
                        legacyId: gameKey.legacyId,
                    },
                    update: {
                        $set: gameKey,
                    },
                    upsert: true,
                },
            }));

            const result = await gameKeyCollection.bulkWrite(
                gameKeyOperations,
                { ordered: false }
            );

            console.log(
                `✅ Game Keys migrated: ${result.upsertedCount + result.modifiedCount}`
            );
        } else {
            console.log('No Game Keys to migrate.');
        }

        // --------------------------------------------------
        // Final verification
        // --------------------------------------------------

        console.log('\n====================================');
        console.log('MongoDB verification');
        console.log('====================================');

        const productCount = await productCollection.countDocuments();
        const giftCardCount = await giftCardCollection.countDocuments();
        const gameKeyCount = await gameKeyCollection.countDocuments();

        console.log('\nSource vs MongoDB');
        console.log('----------------');

        console.log(
            `Products:   ${products.length} → ${productCount}`
        );

        console.log(
            `Gift Cards: ${giftCards.length} → ${giftCardCount}`
        );

        console.log(
            `Game Keys:  ${gameKeys.length} → ${gameKeyCount}`
        );

        const countProblems = [];

        if (productCount !== products.length) {
            countProblems.push(
                `Product count mismatch: expected ${products.length}, found ${productCount}`
            );
        }

        if (giftCardCount !== giftCards.length) {
            countProblems.push(
                `Gift Card count mismatch: expected ${giftCards.length}, found ${giftCardCount}`
            );
        }

        if (gameKeyCount !== gameKeys.length) {
            countProblems.push(
                `Game Key count mismatch: expected ${gameKeys.length}, found ${gameKeyCount}`
            );
        }

        if (countProblems.length > 0) {
            console.error('\n❌ MongoDB verification failed');

            for (const problem of countProblems) {
                console.error(`- ${problem}`);
            }

            process.exitCode = 1;
        } else {
            console.log('\n✅ Product count verified');
            console.log('✅ Gift Card count verified');
            console.log('✅ Game Key count verified');
            console.log('✅ MongoDB counts match Strapi source');
        }

        if (countProblems.length === 0) {
            console.log('\n====================================');
            console.log('MIGRATION COMPLETE');
            console.log('====================================');
        } else {
            console.log('\n====================================');
            console.log('MIGRATION FINISHED WITH ERRORS');
            console.log('====================================');
        }

    } catch (error) {
        console.error('\n❌ Migration failed');
        console.error(error);
        process.exitCode = 1;
    } finally {
        await closeDatabase();
    }
}

migrate();