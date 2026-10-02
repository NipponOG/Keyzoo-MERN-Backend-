'use strict';

const authService = require('./auth.service');
const { verifyTurnstileToken } = require('../../utils/turnstile');
const { getGoogleAuthorizationUrl, getGoogleUser, } = require('../../utils/google-oauth');
const { getDiscordAuthorizationUrl, getDiscordUser, } = require('../../utils/discord-oauth');
const { createHandoffCode, } = require('./oauth-handoff.service');

async function register(req, res, next) {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            dateOfBirth,
            turnstileToken,
        } = req.body;

        const turnstileValid = await verifyTurnstileToken(
            turnstileToken,
            req.ip
        );

        if (!turnstileValid) {
            const error = new Error('Security verification failed');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.registerUser({
            firstName,
            lastName,
            email,
            phone,
            password,
            dateOfBirth,
        });

        res.status(201).json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });

    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const {
            email,
            identifier,
            password,
            turnstileToken,
        } = req.body;

        const turnstileValid = await verifyTurnstileToken(
            turnstileToken,
            req.ip
        );

        if (!turnstileValid) {
            const error = new Error('Security verification failed');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.loginUser({
            email: email || identifier,
            password,
        });

        res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;

        const user =
            await authService.verifyEmail(token);

        res.json({
            success: true,
            message: 'Email verified successfully.',
            user,
        });
    } catch (error) {
        next(error);
    }
}

async function requestPasswordReset(req, res, next) {
    try {
        const { email } = req.body;

        await authService.requestPasswordReset(email);

        /*
         * Always return the same response whether
         * the email exists or not.
         */
        res.json({
            success: true,
            message:
                'If an account exists with that email, a password reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;

        const result = await authService.resetPassword(
            token,
            password
        );

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        const user = await authService.getCurrentUser(
            req.user.userId
        );

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

function googleLogin(req, res) {
    const authorizationUrl = getGoogleAuthorizationUrl();

    res.redirect(authorizationUrl);
}

async function googleCallback(req, res, next) {
    try {
        const { code } = req.query;

        if (!code) {
            const error = new Error('Google authorization code is missing');
            error.statusCode = 400;
            throw error;
        }

        const googleUser = await getGoogleUser(code);

        const result = await authService.loginWithGoogle(googleUser);

        const handoffCode = await createHandoffCode(
            result.user.id,
            'google'
        );

        const frontendUrl =
            process.env.FRONTEND_URL || 'http://localhost:3000';

        res.redirect(
            `${frontendUrl}/auth/google-callback?code=${encodeURIComponent(
                handoffCode
            )}`
        );
    } catch (error) {
        next(error);
    }
}

async function exchangeOAuthCode(req, res, next) {
    try {
        const { code } = req.body;

        if (!code) {
            const error = new Error('OAuth code is required');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.exchangeOAuthHandoffCode(code);

        res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

function discordLogin(req, res) {
    const authorizationUrl = getDiscordAuthorizationUrl();

    res.redirect(authorizationUrl);
}

async function discordCallback(req, res, next) {
    try {
        const { code } = req.query;

        if (!code) {
            const error = new Error(
                'Discord authorization code is missing'
            );
            error.statusCode = 400;
            throw error;
        }

        const discordUser = await getDiscordUser(code);

        const result = await authService.loginWithDiscord(
            discordUser
        );

        const handoffCode = await createHandoffCode(
            result.user.id,
            'discord'
        );

        const frontendUrl =
            process.env.FRONTEND_URL || 'http://localhost:3000';

        res.redirect(
            `${frontendUrl}/auth/discord-callback?code=${encodeURIComponent(
                handoffCode
            )}`
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    getCurrentUser,
    googleLogin,
    googleCallback,
    discordLogin,
    discordCallback,
    exchangeOAuthCode,
};