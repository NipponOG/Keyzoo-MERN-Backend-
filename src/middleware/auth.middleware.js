
'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith('Bearer ')
        ) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            throw error;
        }

        const token = authorization.substring(7);

        const decoded = jwt.verify(token, JWT_SECRET);

        // MFA challenge tokens are only valid
        // for the dedicated 2FA verification flow.
        if (decoded.type === 'mfa-challenge') {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            throw error;
        }

        req.user = decoded;

        next();
    } catch (error) {
        if (error.message === 'Authentication required') {
            return next(error);
        }

        const authError = new Error('Invalid or expired token');
        authError.statusCode = 401;

        next(authError);
    }
}

module.exports = requireAuth;
