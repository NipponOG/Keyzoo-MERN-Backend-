'use strict';

const {
    connectDatabase,
    getDatabase,
    startSession,
    closeDatabase,
} = require('../src/config/database');

async function run() {
    let session;

    try {
        await connectDatabase();

        const db = getDatabase();

        const collection =
            db.collection('transaction_test');

        const testId =
            `test-${Date.now()}`;

        session = startSession();

        console.log(
            '🔄 Starting MongoDB transaction test...'
        );

        await session.withTransaction(
            async () => {
                await collection.insertOne(
                    {
                        testId,
                        message:
                            'This should be rolled back.',
                        createdAt:
                            new Date(),
                    },
                    {
                        session,
                    }
                );

                console.log(
                    '✅ Test document inserted inside transaction.'
                );

                /*
                 * Intentionally abort the transaction.
                 */
                throw new Error(
                    'INTENTIONAL_TRANSACTION_ABORT'
                );
            }
        );
    } catch (error) {
        if (
            error.message ===
            'INTENTIONAL_TRANSACTION_ABORT'
        ) {
            console.log(
                '✅ Transaction intentionally aborted.'
            );
        } else {
            console.error(
                '❌ Transaction test failed:',
                error
            );

            process.exitCode = 1;
        }
    } finally {
        if (session) {
            await session.endSession();
        }

        /*
         * Verify that the transaction rollback
         * actually removed the test document.
         */
        try {
            const db = getDatabase();

            const collection =
                db.collection('transaction_test');

            /*
             * We cannot know testId here after the
             * transaction scope, so simply clean up
             * any test documents created by this test.
             */
            const result =
                await collection.deleteMany({
                    message:
                        'This should be rolled back.',
                });

            if (result.deletedCount === 0) {
                console.log(
                    '✅ Rollback verified: no test document remained.'
                );
            } else {
                console.log(
                    '⚠️ A test document remained and was cleaned up:',
                    result.deletedCount
                );
            }
        } finally {
            await closeDatabase();
        }
    }
}

run();