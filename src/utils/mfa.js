'use strict';

const OTPAuth = require('otpauth');

const ISSUER = 'Keyzoo';
const ALGORITHM = 'SHA1';
const DIGITS = 6;
const PERIOD = 30;

/**
 * Generate a cryptographically secure TOTP secret.
 */
function generateSecret() {
    const secret = new OTPAuth.Secret({
        size: 20,
    });

    return secret.base32;
}

/**
 * Create a TOTP instance for a user.
 */
function createTotp({
    secret,
    email,
}) {
    return new OTPAuth.TOTP({
        issuer: ISSUER,
        label: email,
        algorithm: ALGORITHM,
        digits: DIGITS,
        period: PERIOD,
        secret: OTPAuth.Secret.fromBase32(secret),
    });
}

/**
 * Generate a TOTP secret and otpauth URI.
 */
function createMfaSetup(email) {
    if (
        typeof email !== 'string' ||
        !email.trim()
    ) {
        throw new Error(
            'Email is required to create MFA setup.'
        );
    }

    const secret = generateSecret();

    const totp = createTotp({
        secret,
        email: email.trim().toLowerCase(),
    });

    return {
        secret,
        otpauthUrl: totp.toString(),
    };
}

/**
 * Verify a 6-digit authenticator code.
 */
function verifyMfaCode({
    secret,
    email,
    code,
}) {
    if (
        typeof secret !== 'string' ||
        !secret.trim()
    ) {
        return false;
    }

    if (
        typeof email !== 'string' ||
        !email.trim()
    ) {
        return false;
    }

    if (
        typeof code !== 'string' ||
        !/^\d{6}$/.test(code.trim())
    ) {
        return false;
    }

    const totp = createTotp({
        secret: secret.trim(),
        email: email.trim().toLowerCase(),
    });

    const delta = totp.validate({
        token: code.trim(),
        window: 1,
    });

    return delta !== null;
}

module.exports = {
    createMfaSetup,
    verifyMfaCode,
};