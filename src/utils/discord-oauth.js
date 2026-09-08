'use strict';

const env = require('../config/env');

const DISCORD_AUTH_URL = 'https://discord.com/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USER_URL = 'https://discord.com/api/users/@me';

const DISCORD_REDIRECT_URI =
    'http://localhost:5000/api/v1/auth/discord/callback';

function getDiscordAuthorizationUrl() {
    const params = new URLSearchParams({
        client_id: env.discord.clientId,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email',
    });

    return `${DISCORD_AUTH_URL}?${params.toString()}`;
}

async function getDiscordUser(code) {
    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: env.discord.clientId,
            client_secret: env.discord.clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: DISCORD_REDIRECT_URI,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();

        console.error('Discord token exchange failed:', errorText);

        throw new Error('Failed to authenticate with Discord');
    }

    const tokens = await tokenResponse.json();

    const userResponse = await fetch(DISCORD_USER_URL, {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
        },
    });

    if (!userResponse.ok) {
        throw new Error('Failed to retrieve Discord user information');
    }

    const user = await userResponse.json();

    return {
        providerId: user.id,
        email: user.email || null,
        emailVerified: user.verified === true,
        username: user.username || '',
        globalName: user.global_name || '',
        firstName: user.global_name || user.username || '',
        lastName: '',
        name: user.global_name || user.username || '',
        picture: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : null,
    };
}

module.exports = {
    getDiscordAuthorizationUrl,
    getDiscordUser,
};