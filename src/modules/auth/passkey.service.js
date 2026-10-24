
'use strict';

const { isoUint8Array } = require('@simplewebauthn/server/helpers');
const { generateRegistrationOptions, verifyRegistrationResponse, } = require('@simplewebauthn/server');

const authRepository = require('./auth.repository');
const passkeyRepository = require('./passkey.repository');
const challengeRepository = require('./passkey-challenge.repository');
const { rpName, rpID, origin } = require('../../config/webauthn');

async function getRegistrationOptions(userId) {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        const error = new Error('Admin access required');
        error.statusCode = 403;
        throw error;
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
        const error = new Error('Admin access required');
        error.statusCode = 403;
        throw error;
    }

    const savedChallenge = await challengeRepository.consume(userId);

    if (!savedChallenge) {
        const error = new Error(
            'Registration challenge expired or not found. Please try again.'
        );
        error.statusCode = 400;
        throw error;
    }

    const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: savedChallenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
        const error = new Error('Passkey registration verification failed');
        error.statusCode = 400;
        throw error;
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

async function getPasskeys(userId) {
    const user = await authRepository.findById(userId);

    if (!user || user.role !== 'admin' || user.isBlocked) {
        const error = new Error('Admin access required');
        error.statusCode = 403;
        throw error;
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
        const error = new Error('Admin access required');
        error.statusCode = 403;
        throw error;
    }

    const result = await passkeyRepository.removeById(
        userId,
        passkeyId
    );

    if (result.deletedCount === 0) {
        const error = new Error('Passkey not found');
        error.statusCode = 404;
        throw error;
    }

    return { removed: true };
}

module.exports = {
    getRegistrationOptions,
    verifyRegistration,
    getPasskeys,
    removePasskey,
};
