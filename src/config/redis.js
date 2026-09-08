'use strict';

const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('✅ Valkey or Redis connected');
});

redis.on('error', (error) => {
    console.error('❌ Valkey or Redis connection error:', error);
});

module.exports = redis;