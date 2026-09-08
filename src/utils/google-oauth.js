'use strict';

const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const GOOGLE_REDIRECT_URI = 'http://localhost:5000/api/v1/auth/google/callback';

const googleClient = new OAuth2Client(
    env.google.clientId,
    env.google.clientSecret
);

function getGoogleAuthorizationUrl() {
    return googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'openid',
            'email',
            'profile',
        ],
        prompt: 'select_account',
        redirect_uri: GOOGLE_REDIRECT_URI,
    });
}

async function getGoogleUser(code) {

    const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
    });

    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.google.clientId,
    });

    const payload = ticket.getPayload();

    return {
        providerId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified === true,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        name: payload.name || '',
        picture: payload.picture || null,
    };
}

module.exports = {
    getGoogleAuthorizationUrl,
    getGoogleUser,
};