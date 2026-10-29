'use strict';

const authService = require('../auth/auth.service');
const adminLoginHistoryRepository = require('../auth/admin-login-history.repository');
const passkeyService = require('../auth/passkey.service');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        console.log("=== Admin Login IP Debug ===");
        console.log("Express IP:", req.ip);
        console.log("Socket IP:", req.socket.remoteAddress);
        console.log("X-Forwarded-For:", req.get("x-forwarded-for"));
        console.log("X-Real-IP:", req.get("x-real-ip"));
        console.log("=============================");

        const result = await authService.loginAdmin({
            email,
            password,
        });

        try {
            await adminLoginHistoryRepository.recordSuccessfulLogin({
                userId: result.user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                loginMethod: 'password',
            });
        } catch (historyError) {
            console.error(
                'Failed to record admin login history:',
                historyError
            );
        }

        res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

// async function getCurrentAdmin(req, res) {
//     res.json({
//         success: true,
//         user: {
//             id: req.user.userId,
//             role: req.user.role,
//         },
//     });
// }

async function getCurrentAdmin(req, res, next) {
    try {
        const user = await authService.getCurrentUser(
            req.user.userId
        );

        if (user.role?.name !== 'admin') {
            const error = new Error('Admin access required');
            error.statusCode = 403;
            throw error;
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

async function getLoginActivity(req, res, next) {
    try {
        const adminLoginHistoryRepository = require(
            '../auth/admin-login-history.repository'
        );

        const logins =
            await adminLoginHistoryRepository.findRecentLogins(
                req.user.userId,
                10
            );

        res.json({
            success: true,
            logins: logins.map((login) => ({
                id: login._id.toString(),
                loginMethod: login.loginMethod,
                ipAddress: login.ipAddress,
                userAgent: login.userAgent,
                createdAt: login.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
}

async function getPasskeyRegistrationOptions(req, res, next) {
    try {
        const options = await passkeyService.getRegistrationOptions(
            req.user.userId
        );

        res.json({
            success: true,
            options,
        });
    } catch (error) {
        next(error);
    }
}

async function verifyPasskeyRegistration(req, res, next) {
    try {
        const { response, name } = req.body || {};

        if (!response) {
            const error = new Error(
                'Passkey registration response is required'
            );
            error.statusCode = 400;
            throw error;
        }

        const result = await passkeyService.verifyRegistration(
            req.user.userId,
            response,
            name
        );

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

async function getAdminPasskeys(req, res, next) {
    try {
        const passkeys = await passkeyService.getPasskeys(
            req.user.userId
        );

        res.json({
            success: true,
            passkeys,
        });
    } catch (error) {
        next(error);
    }
}

async function removeAdminPasskey(req, res, next) {
    try {
        const { id } = req.params;

        const result = await passkeyService.removePasskey(
            req.user.userId,
            id
        );

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}


async function getPasskeyAuthenticationOptions(req, res, next) {
    try {
        const result = await passkeyService.getAuthenticationOptions();

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

async function verifyPasskeyAuthentication(req, res, next) {
    try {
        const { challengeKey, response } = req.body || {};

        if (!challengeKey || !response) {
            const error = new Error(
                'Challenge key and passkey response are required'
            );
            error.statusCode = 400;
            throw error;
        }

        const result = await passkeyService.verifyAuthentication(
            challengeKey,
            response
        );

        // Record successful passkey login, but don't fail login if
        // the activity-history write fails.
        try {
            await adminLoginHistoryRepository.recordSuccessfulLogin({
                userId: result.user.id,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                loginMethod: 'passkey',
            });
        } catch (historyError) {
            console.error(
                'Failed to record passkey login history:',
                historyError
            );
        }

        res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });

        console.log('=== PASSKEY IP DEBUG ===');
        console.log('Express IP:', req.ip);
        console.log('Socket IP:', req.socket.remoteAddress);
        console.log('Forwarded IP:', req.get('x-forwarded-for'));
        console.log('Resolved IP chain:', req.ips);
        console.log('CF-Connecting-IP:', req.get('cf-connecting-ip'));
        console.log('========================');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    getCurrentAdmin,
    getLoginActivity,
    getPasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    getAdminPasskeys,
    removeAdminPasskey,
    getPasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
};