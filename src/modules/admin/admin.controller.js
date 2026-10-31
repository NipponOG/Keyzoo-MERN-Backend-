'use strict';

const authService = require('../auth/auth.service');
const adminLoginHistoryRepository = require('../auth/admin-login-history.repository');
const passkeyService = require('../auth/passkey.service');

const { getIpLocation } = require('../auth/ip-location.service');
const loginAttemptService = require('../auth/login-attempt.service');

// async function login(req, res, next) {
//     try {
//         const { email, password } = req.body;

//         console.log("=== Admin Login IP Debug ===");
//         console.log("Express IP:", req.ip);
//         console.log("Socket IP:", req.socket.remoteAddress);
//         console.log("X-Forwarded-For:", req.get("x-forwarded-for"));
//         console.log("X-Real-IP:", req.get("x-real-ip"));
//         console.log("=============================");

//         const result = await authService.loginAdmin({
//             email,
//             password,
//         });

//         const ipAddress = req.get('cf-connecting-ip') || req.ip;

//         let location = null;

//         try {
//             location = await getIpLocation(ipAddress);
//         } catch (error) {
//             console.error('[IP Location] Lookup failed:', error.message);
//         }

//         try {

//             await adminLoginHistoryRepository.recordSuccessfulLogin({
//                 userId: result.user.id,
//                 // ipAddress: req.ip,
//                 // ipAddress: req.get('cf-connecting-ip') || req.ip,
//                 ipAddress,
//                 location,
//                 userAgent: req.get('user-agent'),
//                 loginMethod: 'password',
//             });

//         } catch (historyError) {
//             console.error(
//                 'Failed to record admin login history:',
//                 historyError
//             );
//         }

//         res.json({
//             success: true,
//             jwt: result.jwt,
//             user: result.user,
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// async function getCurrentAdmin(req, res) {
//     res.json({
//         success: true,
//         user: {
//             id: req.user.userId,
//             role: req.user.role,
//         },
//     });
// }

async function login(req, res, next) {
    const { email, password } = req.body || {};

    try {

        console.log('[CLIENT IP DEBUG]', {
            expressIp: req.ip,
            expressIps: req.ips,
            forwardedFor: req.get('x-forwarded-for'),
            realIp: req.get('x-real-ip'),
            cfConnectingIp: req.get('cf-connecting-ip'),
            socketIp: req.socket.remoteAddress,
        });

        // Use Express's resolved client IP.
        // const ipAddress = req.ip || 'unknown';
        const ipAddress = req.get('cf-connecting-ip') || req.ip || 'unknown';

        // Check whether this email + IP combination is locked.
        const lockStatus = await loginAttemptService.getLockStatus(
            email,
            ipAddress
        );

        console.log('[ADMIN LOGIN LOCK CHECK]', {
            email,
            ipAddress,
            locked: lockStatus.locked,
            retryAfter: lockStatus.retryAfter,
        });

        if (lockStatus.locked) {
            res.set(
                'Retry-After',
                String(lockStatus.retryAfter)
            );

            return res.status(429).json({
                success: false,
                message: 'Too many failed login attempts. Please try again later.',
                retryAfter: lockStatus.retryAfter,
            });
        }

        const result = await authService.loginAdmin({
            email,
            password,
        });

        // Successful login: clear this combination's failed attempts.
        await loginAttemptService.clearFailures(email, ipAddress);

        // Record successful login activity.
        const historyIpAddress =
            req.get('cf-connecting-ip') || ipAddress;

        let location = null;

        try {
            location = await getIpLocation(historyIpAddress);
        } catch (error) {
            console.error(
                '[IP Location] Lookup failed:',
                error.message
            );
        }

        try {
            await adminLoginHistoryRepository.recordSuccessfulLogin({
                userId: result.user.id,
                ipAddress: historyIpAddress,
                location,
                userAgent: req.get('user-agent'),
                loginMethod: 'password',
            });
        } catch (historyError) {
            console.error(
                'Failed to record admin login history:',
                historyError
            );
        }

        return res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });

    } catch (error) {
        // Count only invalid email/password responses.
        if (error.statusCode === 401) {
            try {
                // const ipAddress = req.ip || 'unknown';
                const ipAddress = req.get('cf-connecting-ip') || req.ip || 'unknown';

                const attemptResult =
                    await loginAttemptService.recordFailure(
                        email,
                        ipAddress
                    );

                console.log('[ADMIN LOGIN FAILURE]', {
                    attempts: attemptResult.attempts,
                    locked: attemptResult.locked,
                    retryAfter: attemptResult.retryAfter,
                });

                if (attemptResult.locked) {
                    error.message =
                        'Too many failed login attempts. Please try again later.';
                    error.statusCode = 429;
                    error.retryAfter = attemptResult.retryAfter;
                }
            } catch (rateLimitError) {
                console.error(
                    '[Admin Login Protection] Redis error:',
                    rateLimitError.message
                );

                const serviceError = new Error(
                    'Login protection is temporarily unavailable. Please try again later.'
                );
                serviceError.statusCode = 503;
                return next(serviceError);
            }
        }

        if (error.statusCode === 429 && error.retryAfter) {
            res.set('Retry-After', String(error.retryAfter));
            return res.status(429).json({
                success: false,
                message: error.message,
                retryAfter: error.retryAfter,
            });
        }

        return next(error);
    }
}

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
                location: login.location || null,
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

        const ipAddress = req.get('cf-connecting-ip') || req.ip;

        let location = null;

        try {
            location = await getIpLocation(ipAddress);
        } catch (error) {
            console.error('[IP Location] Lookup failed:', error.message);
        }

        // Record successful passkey login, but don't fail login if
        // the activity-history write fails.
        try {
            await adminLoginHistoryRepository.recordSuccessfulLogin({
                userId: result.user.id,
                // ipAddress: req.ip,
                // ipAddress: req.get('cf-connecting-ip') || req.ip,
                ipAddress,
                location,
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
        console.log('X-Forwarded-Host:', req.get('x-forwarded-host'));
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