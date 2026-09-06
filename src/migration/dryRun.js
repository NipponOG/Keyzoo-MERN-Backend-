'use strict';

const { fetchAll } = require('./strapi.client');
const {
    mapProduct,
    mapGiftCard,
    mapGameKey,
} = require('./migration.mapper');

async function dryRun() {
    try {
        console.log('\n🔎 Keyzoo MongoDB migration DRY RUN');
        console.log('====================================\n');

        const products = await fetchAll('products');
        const giftCards = await fetchAll('gift-cards');
        const gameKeys = await fetchAll('game-keys');

        const mappedProducts = products.map(mapProduct);
        const mappedGiftCards = giftCards.map(mapGiftCard);
        const mappedGameKeys = gameKeys.map(mapGameKey);

        console.log('Source records');
        console.log('----------------');
        console.log(`Products:   ${products.length}`);
        console.log(`Gift Cards: ${giftCards.length}`);
        console.log(`Game Keys:  ${gameKeys.length}`);

        console.log('\nMapped records');
        console.log('----------------');
        console.log(`Products:   ${mappedProducts.length}`);
        console.log(`Gift Cards: ${mappedGiftCards.length}`);
        console.log(`Game Keys:  ${mappedGameKeys.length}`);

        console.log('\n====================================');
        console.log('Mapped Product');
        console.log('====================================');

        if (mappedProducts.length) {
            console.dir(mappedProducts[0], {
                depth: null,
                colors: true,
            });
        }

        console.log('\n====================================');
        console.log('Mapped Gift Card');
        console.log('====================================');

        if (mappedGiftCards.length) {
            console.dir(mappedGiftCards[0], {
                depth: null,
                colors: true,
            });
        }

        console.log('\n====================================');
        console.log('Mapped Game Keys');
        console.log('====================================');

        mappedGameKeys.forEach((gameKey) => {
            console.dir(gameKey, {
                depth: null,
                colors: true,
            });
        });

        console.log('\n====================================');
        console.log('DRY RUN COMPLETE');
        console.log('====================================');

        console.log('✅ No MongoDB data was written.');
        console.log('✅ No Strapi data was changed.');
    } catch (error) {
        console.error('\n❌ Migration dry run failed');
        console.error(error);

        process.exitCode = 1;
    }
}

dryRun();