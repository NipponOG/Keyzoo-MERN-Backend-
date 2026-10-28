
'use strict';

const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Send errors to Sentry without collecting performance traces.
    tracesSampleRate: 0,
    // Avoid sending request bodies, which may contain sensitive data.
    sendDefaultPii: false,
});
