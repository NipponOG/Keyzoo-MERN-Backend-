
'use strict';

const { randomUUID } = require('node:crypto');

const {
    isoUint8Array,
} = require('@simplewebauthn/server/helpers');

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const authRepository = require('./auth.repository');
const authService = require('./auth.service');
const passkeyRepository = require('./passkey.repository');
const challengeRepository = require('./passkey-challenge.repository');
const { rpName, rpID, origin } = require('../../config/webauthn');

function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function getRegistrationOptions(userId) {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        throw createError('Admin access required', 403);
    }

    const existingPasskeys = await passkeyRepository.findByUserId(userId);

    const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: isoUint8Array.fromUTF8String(user._id.toString()),
        userName: user.email,
        userDisplayName: user.username || user.email,
        attestationType: 'none',
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'required',
        },
        excludeCredentials: existingPasskeys.map((passkey) => ({
            id: passkey.credentialId,
            transports: passkey.transports,
        })),
    });

    await challengeRepository.save(userId, options.challenge);

    return options;
}

async function verifyRegistration(userId, response, name = 'My passkey') {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        throw createError('Admin access required', 403);
    }

    const savedChallenge = await challengeRepository.consume(userId);

    if (!savedChallenge) {
        throw createError(
            'Registration challenge expired or not found. Please try again.',
            400
        );
    }

    const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: savedChallenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
        throw createError('Passkey registration verification failed', 400);
    }

    const { registrationInfo } = verification;
    const credential = registrationInfo.credential;

    await passkeyRepository.create({
        userId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: response.response?.transports || [],
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        name: typeof name === 'string' && name.trim()
            ? name.trim().slice(0, 60)
            : 'My passkey',
    });

    return { verified: true };
}

async function getAuthenticationOptions() {
    const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'required',
    });

    // Use a unique key per attempt so simultaneous logins do not overwrite
    // one another's challenges. The key is not an authentication credential.
    const challengeKey = randomUUID();

    await challengeRepository.save(
        challengeKey,
        options.challenge,
        'authentication'
    );

    return {
        options,
        challengeKey,
    };
}

async function verifyAuthentication(challengeKey, response) {
    if (
        typeof challengeKey !== 'string' ||
        !challengeKey ||
        !response ||
        typeof response.id !== 'string'
    ) {
        throw createError('Invalid passkey authentication request', 400);
    }

    // Consume the challenge before verification so it cannot be replayed.
    const savedChallenge = await challengeRepository.consume(
        challengeKey,
        'authentication'
    );

    if (!savedChallenge) {
        throw createError(
            'Authentication challenge expired or already used. Please try again.',
            400
        );
    }

    const passkey = await passkeyRepository.findByCredentialId(response.id);

    if (!passkey) {
        throw createError('Invalid passkey or authentication failed', 401);
    }

    const user = await authRepository.findById(passkey.userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        throw createError('Admin access required', 403);
    }

    let verification;

    try {
        verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: savedChallenge.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: true,
            credential: {
                id: passkey.credentialId,
                publicKey: Buffer.from(passkey.publicKey, 'base64url'),
                counter: passkey.counter,
                transports: passkey.transports,
            },
        });
    } catch {
        throw createError('Passkey authentication failed', 401);
    }

    if (!verification.verified) {
        throw createError('Passkey authentication failed', 401);
    }

    const { authenticationInfo } = verification;

    await passkeyRepository.updateCounter(
        passkey.credentialId,
        authenticationInfo.newCounter,
        authenticationInfo.credentialBackedUp
    );

    return {
        verified: true,
        jwt: authService.createToken(user),
        user: authService.sanitizeUser(user),
    };
}

async function getPasskeys(userId) {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        throw createError('Admin access required', 403);
    }

    const passkeys = await passkeyRepository.findByUserId(userId);

    return passkeys.map((passkey) => ({
        id: passkey._id.toString(),
        name: passkey.name,
        deviceType: passkey.deviceType,
        backedUp: passkey.backedUp,
        createdAt: passkey.createdAt,
        lastUsedAt: passkey.lastUsedAt,
    }));
}

async function removePasskey(userId, passkeyId) {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        throw createError('Admin access required', 403);
    }

    const result = await passkeyRepository.removeById(userId, passkeyId);

    if (result.deletedCount === 0) {
        throw createError('Passkey not found', 404);
    }

    return { removed: true };
}

module.exports = {
    getRegistrationOptions,
    verifyRegistration,
    getAuthenticationOptions,
    verifyAuthentication,
    getPasskeys,
    removePasskey,
};
