'use strict';

const app = require('./app');
const env = require('./config/env');
const { connectDatabase, closeDatabase } = require('./config/database');
const authRepository = require('./modules/auth/auth.repository');

async function startServer() {
    try {
        await connectDatabase();
        await authRepository.ensureIndexes();

        console.log('✅ Auth indexes ready');

        const server = app.listen(env.port, () => {
            console.log(`🚀 Keyzoo backend running on port ${env.port}`);
        });

        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down...`);

            server.close(async () => {
                await closeDatabase();

                console.log('✅ Server shut down cleanly');

                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();