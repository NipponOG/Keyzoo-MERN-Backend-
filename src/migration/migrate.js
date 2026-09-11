'use strict';

require('dotenv').config();

const { ObjectId } = require('mongodb');

const { getDatabase, connectDatabase } = require('../config/database');

const {
    mapProduct,
    mapGiftCard,
    mapGameKey,
} = require('./migration.mapper');

const {
    fetchAll,
} = require('./strapi.client');

const PRODUCTS_COLLECTION = 'products';
const GIFT_CARDS_COLLECTION = 'gift_cards';
const GAME_KEYS_COLLECTION = 'game_keys';

async function resetCollections(db) {
    if (process.env.RESET_MIGRATION_DATA !== 'true') {
        throw new Error(
            'Migration reset blocked. Set RESET_MIGRATION_DATA=true before running the clean migration.'
        );
    }

    console.log('\n🧹 Resetting migration collections...');
    console.log('\n🧹 Resetting migration collections...');

    for (const collectionName of [
        PRODUCTS_COLLECTION,
        GIFT_CARDS_COLLECTION,
        GAME_KEYS_COLLECTION,
    ]) {
        const exists = await db
            .listCollections({ name: collectionName })
            .hasNext();

        if (exists) {
            await db.collection(collectionName).drop();
            console.log(`   ✓ Dropped ${collectionName}`);
        } else {
            console.log(`   - ${collectionName} does not exist`);
        }
    }
}

async function createIndexes(db) {
    console.log('\n📌 Creating indexes...');

    await db.collection(PRODUCTS_COLLECTION).createIndex(
        { slug: 1 },
        {
            unique: true,
            name: 'slug_1',
        }
    );

    await db.collection(GIFT_CARDS_COLLECTION).createIndex(
        { slug: 1 },
        {
            unique: true,
            name: 'slug_1',
        }
    );

    await db.collection(GAME_KEYS_COLLECTION).createIndex(
        { code: 1 },
        {
            unique: true,
            name: 'code_1',
        }
    );

    await db.collection(GAME_KEYS_COLLECTION).createIndex(
        { productId: 1 },
        {
            name: 'productId_1',
        }
    );

    await db.collection(GAME_KEYS_COLLECTION).createIndex(
        { giftCardId: 1 },
        {
            name: 'giftCardId_1',
        }
    );

    console.log('   ✓ Product slug index');
    console.log('   ✓ Gift card slug index');
    console.log('   ✓ Game key code index');
    console.log('   ✓ Game key productId index');
    console.log('   ✓ Game key giftCardId index');
}

function validateGameKeyRelationships(
    gameKeys,
    productIdMap,
    giftCardIdMap
) {
    const errors = [];

    for (const gameKey of gameKeys) {
        const hasProduct = Boolean(gameKey.product?.id);
        const hasGiftCard = Boolean(gameKey.giftCard?.id);

        if (hasProduct) {
            const mongoProductId = productIdMap.get(
                gameKey.product.id
            );

            if (!mongoProductId) {
                errors.push(
                    `Game key ${gameKey.id} references missing product ${gameKey.product.id}`
                );
            }
        }

        if (hasGiftCard) {
            const mongoGiftCardId = giftCardIdMap.get(
                gameKey.giftCard.id
            );

            if (!mongoGiftCardId) {
                errors.push(
                    `Game key ${gameKey.id} references missing gift card ${gameKey.giftCard.id}`
                );
            }
        }

        if (hasProduct && hasGiftCard) {
            errors.push(
                `Game key ${gameKey.id} references both product and gift card`
            );
        }

        if (!hasProduct && !hasGiftCard) {
            errors.push(
                `Game key ${gameKey.id} has no product or gift card owner`
            );
        }
    }

    if (errors.length > 0) {
        const error = new Error(
            `Game key relationship validation failed:\n${errors.join('\n')}`
        );

        error.statusCode = 500;
        throw error;
    }
}

async function migrate() {
    console.log('\n========================================');
    console.log('   KEYZOO CLEAN MONGODB MIGRATION');
    console.log('========================================\n');

    // --------------------------------------------------
    // 1. Connect to MongoDB
    // --------------------------------------------------

    await connectDatabase();

    const db = getDatabase();

    console.log(`📦 MongoDB database: ${db.databaseName}`);

    // --------------------------------------------------
    // 2. Fetch Strapi data
    // --------------------------------------------------

    console.log('\n📡 Fetching data from Strapi...');

    const [
        products,
        giftCards,
        gameKeys,
    ] = await Promise.all([
        fetchAll('products'),
        fetchAll('gift-cards'),
        fetchAll('game-keys'),
    ]);

    console.log(`   Products:    ${products.length}`);
    console.log(`   Gift Cards:  ${giftCards.length}`);
    console.log(`   Game Keys:   ${gameKeys.length}`);

    // --------------------------------------------------
    // 3. Validate source relationships
    // --------------------------------------------------

    console.log('\n🔍 Validating source relationships...');

    const productSourceIds = new Set(
        products.map((product) => product.id)
    );

    const giftCardSourceIds = new Set(
        giftCards.map((giftCard) => giftCard.id)
    );

    for (const gameKey of gameKeys) {
        if (gameKey.product?.id) {
            if (!productSourceIds.has(gameKey.product.id)) {
                throw new Error(
                    `Game key ${gameKey.id} references product ${gameKey.product.id}, but that product was not fetched.`
                );
            }
        }

        if (gameKey.giftCard?.id) {
            if (!giftCardSourceIds.has(gameKey.giftCard.id)) {
                throw new Error(
                    `Game key ${gameKey.id} references gift card ${gameKey.giftCard.id}, but that gift card was not fetched.`
                );
            }
        }
    }

    console.log('   ✓ Source relationships are valid');

    // --------------------------------------------------
    // 4. Reset current migration collections
    // --------------------------------------------------

    await resetCollections(db);

    // --------------------------------------------------
    // 5. Create clean indexes
    // --------------------------------------------------

    await createIndexes(db);

    // --------------------------------------------------
    // 6. Map products
    // --------------------------------------------------

    console.log('\n🛒 Migrating products...');

    const productDocuments = products.map(mapProduct);

    const productResult = productDocuments.length
        ? await db
            .collection(PRODUCTS_COLLECTION)
            .insertMany(productDocuments)
        : { insertedIds: {} };

    console.log(
        `   ✓ Inserted ${productDocuments.length} products`
    );

    // --------------------------------------------------
    // 7. Build Strapi Product ID → Mongo ObjectId map
    // --------------------------------------------------

    const productIdMap = new Map();

    products.forEach((product, index) => {
        const mongoId =
            productResult.insertedIds[index];

        if (!mongoId) {
            throw new Error(
                `Could not determine MongoDB _id for product ${product.id}`
            );
        }

        productIdMap.set(
            product.id,
            mongoId
        );
    });

    console.log(
        `   ✓ Created ${productIdMap.size} product ID mappings`
    );

    // --------------------------------------------------
    // 8. Map gift cards
    // --------------------------------------------------

    console.log('\n🎁 Migrating gift cards...');

    const giftCardDocuments =
        giftCards.map(mapGiftCard);

    const giftCardResult = giftCardDocuments.length
        ? await db
            .collection(GIFT_CARDS_COLLECTION)
            .insertMany(giftCardDocuments)
        : { insertedIds: {} };

    console.log(
        `   ✓ Inserted ${giftCardDocuments.length} gift cards`
    );

    // --------------------------------------------------
    // 9. Build Strapi Gift Card ID → Mongo ObjectId map
    // --------------------------------------------------

    const giftCardIdMap = new Map();

    giftCards.forEach((giftCard, index) => {
        const mongoId =
            giftCardResult.insertedIds[index];

        if (!mongoId) {
            throw new Error(
                `Could not determine MongoDB _id for gift card ${giftCard.id}`
            );
        }

        giftCardIdMap.set(
            giftCard.id,
            mongoId
        );
    });

    console.log(
        `   ✓ Created ${giftCardIdMap.size} gift card ID mappings`
    );

    // --------------------------------------------------
    // 10. Validate game key relationships
    // --------------------------------------------------

    console.log('\n🔗 Validating game key mappings...');

    validateGameKeyRelationships(
        gameKeys,
        productIdMap,
        giftCardIdMap
    );

    console.log('   ✓ All game key relationships can be resolved');

    // --------------------------------------------------
    // 11. Map game keys using Mongo ObjectIds
    // --------------------------------------------------

    console.log('\n🔑 Migrating game keys...');

    const gameKeyDocuments = gameKeys.map(
        (gameKey) =>
            mapGameKey(
                gameKey,
                productIdMap,
                giftCardIdMap
            )
    );

    // Safety check:
    // no game key should contain legacy identity fields.
    for (const document of gameKeyDocuments) {
        if (
            'legacyId' in document ||
            'legacyDocumentId' in document ||
            'ownerType' in document ||
            'ownerId' in document
        ) {
            throw new Error(
                'Clean migration safety check failed: legacy game-key fields detected.'
            );
        }

        if (
            document.productId !== null &&
            !(document.productId instanceof ObjectId)
        ) {
            throw new Error(
                'Clean migration safety check failed: productId is not a MongoDB ObjectId.'
            );
        }

        if (
            document.giftCardId !== null &&
            !(document.giftCardId instanceof ObjectId)
        ) {
            throw new Error(
                'Clean migration safety check failed: giftCardId is not a MongoDB ObjectId.'
            );
        }
    }

    const gameKeyResult = gameKeyDocuments.length
        ? await db
            .collection(GAME_KEYS_COLLECTION)
            .insertMany(gameKeyDocuments)
        : { insertedIds: {} };

    console.log(
        `   ✓ Inserted ${gameKeyDocuments.length} game keys`
    );

    // --------------------------------------------------
    // 12. Verify final counts
    // --------------------------------------------------

    console.log('\n📊 Verifying migration...');

    const [
        productCount,
        giftCardCount,
        gameKeyCount,
    ] = await Promise.all([
        db.collection(PRODUCTS_COLLECTION).countDocuments(),
        db.collection(GIFT_CARDS_COLLECTION).countDocuments(),
        db.collection(GAME_KEYS_COLLECTION).countDocuments(),
    ]);

    console.log(`   Products:    ${productCount}/${products.length}`);
    console.log(`   Gift Cards:  ${giftCardCount}/${giftCards.length}`);
    console.log(`   Game Keys:   ${gameKeyCount}/${gameKeys.length}`);

    if (productCount !== products.length) {
        throw new Error(
            `Product count mismatch: expected ${products.length}, got ${productCount}`
        );
    }

    if (giftCardCount !== giftCards.length) {
        throw new Error(
            `Gift card count mismatch: expected ${giftCards.length}, got ${giftCardCount}`
        );
    }

    if (gameKeyCount !== gameKeys.length) {
        throw new Error(
            `Game key count mismatch: expected ${gameKeys.length}, got ${gameKeyCount}`
        );
    }

    // --------------------------------------------------
    // 13. Verify clean schema
    // --------------------------------------------------

    console.log('\n🧼 Checking for legacy fields...');

    const legacyProduct = await db
        .collection(PRODUCTS_COLLECTION)
        .findOne({
            $or: [
                { legacyId: { $exists: true } },
                { legacyDocumentId: { $exists: true } },
                { legacyCreatedAt: { $exists: true } },
                { legacyUpdatedAt: { $exists: true } },
                { migratedAt: { $exists: true } },
            ],
        });

    const legacyGiftCard = await db
        .collection(GIFT_CARDS_COLLECTION)
        .findOne({
            $or: [
                { legacyId: { $exists: true } },
                { legacyDocumentId: { $exists: true } },
                { legacyCreatedAt: { $exists: true } },
                { legacyUpdatedAt: { $exists: true } },
                { migratedAt: { $exists: true } },
            ],
        });

    const legacyGameKey = await db
        .collection(GAME_KEYS_COLLECTION)
        .findOne({
            $or: [
                { legacyId: { $exists: true } },
                { legacyDocumentId: { $exists: true } },
                { legacyCreatedAt: { $exists: true } },
                { legacyUpdatedAt: { $exists: true } },
                { migratedAt: { $exists: true } },
                { ownerType: { $exists: true } },
                { ownerId: { $exists: true } },
            ],
        });

    if (
        legacyProduct ||
        legacyGiftCard ||
        legacyGameKey
    ) {
        throw new Error(
            'Legacy fields were found in the migrated database.'
        );
    }

    console.log('   ✓ No legacy identity fields found');

    // --------------------------------------------------
    // 14. Verify game key references
    // --------------------------------------------------

    console.log('\n🔗 Checking game key references...');

    const migratedGameKeys = await db
        .collection(GAME_KEYS_COLLECTION)
        .find({})
        .toArray();

    for (const gameKey of migratedGameKeys) {
        if (gameKey.productId) {
            const product = await db
                .collection(PRODUCTS_COLLECTION)
                .findOne({
                    _id: gameKey.productId,
                });

            if (!product) {
                throw new Error(
                    `Game key ${gameKey._id} references missing product ${gameKey.productId}`
                );
            }
        }

        if (gameKey.giftCardId) {
            const giftCard = await db
                .collection(GIFT_CARDS_COLLECTION)
                .findOne({
                    _id: gameKey.giftCardId,
                });

            if (!giftCard) {
                throw new Error(
                    `Game key ${gameKey._id} references missing gift card ${gameKey.giftCardId}`
                );
            }
        }
    }

    console.log('   ✓ All game key references are valid');

    // --------------------------------------------------
    // Done
    // --------------------------------------------------

    console.log('\n========================================');
    console.log('   ✅ CLEAN MIGRATION COMPLETED');
    console.log('========================================');

    console.log('\nFinal MongoDB counts:');
    console.log(`   Products:   ${productCount}`);
    console.log(`   Gift Cards: ${giftCardCount}`);
    console.log(`   Game Keys:  ${gameKeyCount}`);

    console.log('\nMongoDB is now using _id as the primary identity.');
    console.log('Strapi IDs were used only during migration.\n');
}

migrate()
    .catch((error) => {
        console.error('\n❌ MIGRATION FAILED');
        console.error(error);
        process.exitCode = 1;
    });