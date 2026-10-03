'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const repository = require('./auth.repository');
const { consumeHandoffCode, } = require('./oauth-handoff.service');
const { createMfaSetup, verifyMfaCode, } = require('../../utils/mfa');

const { sendEmail, } = require('../../services/email.service');
const { buildWelcomeEmail, buildVerificationEmail, buildPasswordResetEmail, buildPasswordChangedEmail } = require('../../services/auth.email.templates');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MFA_CHALLENGE_EXPIRES_IN = '5m';

function generateRecoveryCode() {
    const partOne = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase();

    const partTwo = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase();

    return `KZ-${partOne}-${partTwo}`;
}

function hashRecoveryCode(code) {
    return crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
}

function generateRecoveryCodes(count = 10) {
    const codes = [];
    const hashes = [];

    for (let index = 0; index < count; index += 1) {
        const code = generateRecoveryCode();

        codes.push(code);
        hashes.push(hashRecoveryCode(code));
    }

    return {
        codes,
        hashes,
    };
}

async function registerUser({
    firstName,
    lastName,
    email,
    phone,
    password,
    dateOfBirth,
}) {

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password
    ) {
        const error = new Error(
            'First name, last name, email, phone and password are required'
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const normalizedPhone = phone
        .toString()
        .replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        const error = new Error(
            'Please enter a valid 10-digit Indian phone number.'
        );

        error.statusCode = 400;
        throw error;
    }

    const existingUser = await repository.findByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await repository.create({
        username: `${firstName.trim()} ${lastName.trim()}`,
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: 'customer',
        provider: 'local',
        isEmailVerified: false,
        isBlocked: false,
        twoFactorEnabled: false,
    });

    /*
 * Generate email verification token.
 * Only the hash is stored in MongoDB.
 */
    const verificationToken =
        crypto.randomBytes(32).toString('hex');

    const verificationTokenHash =
        crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

    const verificationTokenExpiresAt =
        new Date(Date.now() + 30 * 60 * 1000);

    await repository.setEmailVerificationToken(
        user._id.toString(),
        verificationTokenHash,
        verificationTokenExpiresAt
    );

    const frontendUrl =
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

    const verificationUrl =
        `${frontendUrl}/verify-email?token=${encodeURIComponent(
            verificationToken
        )}`;

    /*
     * Send welcome email.
     */
    try {
        const html = buildWelcomeEmail({
            name: firstName.trim(),
            email: normalizedEmail,
            frontendUrl,
        });

        await sendEmail({
            to: normalizedEmail,
            subject: 'Welcome to Keyzoo 🎮',
            html,
        });
    } catch (emailError) {
        console.error(
            '⚠️ Welcome email could not be sent:',
            emailError
        );
    }

    /*
     * Send email verification email.
     */
    try {
        const html = buildVerificationEmail({
            name: firstName.trim(),
            email: normalizedEmail,
            verificationUrl,
            expiresIn: '30 minutes',
        });

        await sendEmail({
            to: normalizedEmail,
            subject: 'Verify Your Keyzoo Email Address',
            html,
        });
    } catch (emailError) {
        console.error(
            '⚠️ Verification email could not be sent:',
            emailError
        );
    }

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
    };
}

async function requestPasswordReset(email) {
    if (!email || typeof email !== 'string') {
        const error = new Error(
            'Email address is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail =
        email.trim().toLowerCase();

    const user =
        await repository.findByEmail(normalizedEmail);

    /*
     * Do not reveal whether an email exists.
     */
    if (!user) {
        return;
    }

    const resetToken =
        crypto.randomBytes(32).toString('hex');

    const resetTokenHash =
        crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

    const resetTokenExpiresAt =
        new Date(Date.now() + 30 * 60 * 1000);

    await repository.setPasswordResetToken(
        user._id.toString(),
        resetTokenHash,
        resetTokenExpiresAt
    );

    const frontendUrl =
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

    const resetUrl =
        `${frontendUrl}/change-password?token=${encodeURIComponent(
            resetToken
        )}`;

    try {
        const html = buildPasswordResetEmail({
            name: user.firstName || user.username || 'there',
            email: user.email,
            resetUrl,
            expiresIn: '30 minutes',
        });

        await sendEmail({
            to: user.email,
            subject: 'Reset Your Keyzoo Password',
            html,
        });
    } catch (emailError) {
        console.error(
            '⚠️ Password reset email could not be sent:',
            emailError
        );
    }
}

async function resetPassword(token, password) {
    if (!token || typeof token !== 'string') {
        const error = new Error(
            'Password reset token is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (!password || typeof password !== 'string') {
        const error = new Error(
            'New password is required'
        );

        error.statusCode = 400;
        throw error;
    }

    if (password.length < 8) {
        const error = new Error(
            'Password must be at least 8 characters long'
        );

        error.statusCode = 400;
        throw error;
    }

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user =
        await repository.findByPasswordResetTokenHash(
            tokenHash
        );

    if (!user) {
        const error = new Error(
            'Invalid or expired password reset link'
        );

        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    const updatedUser =
        await repository.updatePasswordAndClearResetToken(
            user._id.toString(),
            passwordHash
        );

    if (!updatedUser) {
        const error = new Error(
            'Password reset could not be completed'
        );

        error.statusCode = 400;
        throw error;
    }

    try {
        const html = buildPasswordChangedEmail({
            name:
                updatedUser.firstName ||
                updatedUser.username ||
                'there',
            email: updatedUser.email,
        });

        await sendEmail({
            to: updatedUser.email,
            subject: 'Your Keyzoo Password Was Changed',
            html,
        });
    } catch (emailError) {
        console.error(
            '⚠️ Password changed email could not be sent:',
            emailError
        );
    }

    return {
        message: 'Password reset successfully.',
    };
}

async function loginUser({ email, password }) {
    if (!email || !password) {
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await repository.findByEmail(normalizedEmail);

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    if (!user.passwordHash) {
        const error = new Error('This account does not support password login');
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error(
            'Invalid email or password'
        );
        error.statusCode = 401;
        throw error;
    }

    if (user.twoFactorEnabled) {
        return {
            requiresTwoFactor: true,
            challengeToken:
                createMfaChallengeToken(user),
        };
    }

    const token = createToken(user);

    return {
        jwt: token,
        user: sanitizeUser(user),
    };
}

async function verifyEmail(token) {
    if (!token || typeof token !== 'string') {
        const error = new Error(
            'Email verification token is required'
        );

        error.statusCode = 400;
        throw error;
    }

    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user =
        await repository.findByEmailVerificationTokenHash(
            tokenHash
        );

    if (!user) {
        const error = new Error(
            'Invalid or expired email verification link'
        );

        error.statusCode = 400;
        throw error;
    }

    const verifiedUser =
        await repository.markEmailVerified(
            user._id.toString()
        );

    if (!verifiedUser) {
        const error = new Error(
            'Email verification could not be completed'
        );

        error.statusCode = 400;
        throw error;
    }

    return sanitizeUser(verifiedUser);
}

async function loginAdmin({ email, password }) {
    if (!email || !password) {
        const error = new Error(
            'Email and password are required'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await repository.findByEmail(
        normalizedEmail
    );

    if (!user) {
        const error = new Error(
            'Invalid email or password'
        );
        error.statusCode = 401;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error(
            'Your account has been blocked'
        );
        error.statusCode = 403;
        throw error;
    }

    if (user.role !== 'admin') {
        const error = new Error(
            'Admin access required'
        );
        error.statusCode = 403;
        throw error;
    }

    if (!user.passwordHash) {
        const error = new Error(
            'This admin account does not have password login enabled'
        );
        error.statusCode = 400;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error(
            'Invalid email or password'
        );
        error.statusCode = 401;
        throw error;
    }

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
    };
}

async function loginWithGoogle(googleUser) {
    if (!googleUser?.providerId || !googleUser?.email) {
        const error = new Error('Invalid Google account information');
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase();

    // 1. Check whether this Google account already exists
    let user = await repository.findByGoogleId(
        googleUser.providerId
    );

    if (user) {
        if (user.isBlocked) {
            const error = new Error('Your account has been blocked');
            error.statusCode = 403;
            throw error;
        }

        return {
            jwt: createToken(user),
            user: sanitizeUser(user),
        };
    }

    // 2. Check whether the email already belongs to a Keyzoo account
    user = await repository.findByEmail(normalizedEmail);

    if (user) {
        const error = new Error(
            'An account with this email already exists. Please sign in with your existing login method.'
        );
        error.statusCode = 409;
        throw error;
    }

    // 3. Create a new Google user
    user = await repository.create({
        username:
            googleUser.name ||
            `${googleUser.firstName} ${googleUser.lastName}`.trim(),

        email: normalizedEmail,

        passwordHash: null,

        firstName: googleUser.firstName,
        lastName: googleUser.lastName,

        dateOfBirth: null,

        role: 'customer',

        provider: 'google',

        googleId: googleUser.providerId,

        profileImage: googleUser.picture,

        isEmailVerified: googleUser.emailVerified,

        isBlocked: false,

        twoFactorEnabled: false,
    });

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
    };
}

async function getCurrentUser(userId) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    const user = await repository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    return sanitizeUser(user);
}

async function updateCurrentUser(
    userId,
    {
        firstName,
        lastName,
        phone,
    }
) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    if (
        typeof firstName !== 'string' ||
        !firstName.trim()
    ) {
        const error = new Error('First name is required');
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof lastName !== 'string' ||
        !lastName.trim()
    ) {
        const error = new Error('Last name is required');
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof phone !== 'string' ||
        !phone.trim()
    ) {
        const error = new Error('Phone number is required');
        error.statusCode = 400;
        throw error;
    }

    const normalizedPhone = phone
        .replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        const error = new Error(
            'Please enter a valid 10-digit Indian phone number.'
        );
        error.statusCode = 400;
        throw error;
    }

    const existingUser =
        await repository.findById(userId);

    if (!existingUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (existingUser.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    const updatedUser =
        await repository.updateProfile(
            userId,
            {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: normalizedPhone,
            }
        );

    if (!updatedUser) {
        const error = new Error(
            'Profile could not be updated'
        );
        error.statusCode = 500;
        throw error;
    }

    return sanitizeUser(updatedUser);
}

function createMfaChallengeToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            type: 'mfa-challenge',
        },
        JWT_SECRET,
        {
            expiresIn: MFA_CHALLENGE_EXPIRES_IN,
        }
    );
}

async function verifyMfaChallenge(
    challengeToken,
    code
) {
    if (
        typeof challengeToken !== 'string' ||
        !challengeToken.trim()
    ) {
        const error = new Error(
            'MFA challenge token is required.'
        );
        error.statusCode = 401;
        throw error;
    }

    if (
        typeof code !== 'string' ||
        !code.trim()
    ) {
        const error = new Error(
            'Two-factor authentication code is required.'
        );
        error.statusCode = 400;
        throw error;
    }

    let payload;

    try {
        payload = jwt.verify(
            challengeToken.trim(),
            JWT_SECRET
        );
    } catch (error) {
        const authError = new Error(
            'MFA challenge has expired or is invalid.'
        );
        authError.statusCode = 401;
        throw authError;
    }

    if (
        payload?.type !== 'mfa-challenge' ||
        !payload?.userId
    ) {
        const error = new Error(
            'Invalid MFA challenge.'
        );
        error.statusCode = 401;
        throw error;
    }

    const user =
        await repository.findById(payload.userId);

    if (!user) {
        const error = new Error(
            'User not found.'
        );
        error.statusCode = 404;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error(
            'Your account is blocked.'
        );
        error.statusCode = 403;
        throw error;
    }

    if (!user.twoFactorEnabled) {
        const error = new Error(
            'Two-factor authentication is not enabled.'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedCode = code.trim();

    let verified = false;

    if (/^\d{6}$/.test(normalizedCode)) {
        verified = verifyMfaCode({
            secret: user.twoFactorSecret,
            email: user.email,
            code: normalizedCode,
        });
    } else if (
        /^KZ-[A-F0-9]{8}-[A-F0-9]{8}$/.test(
            normalizedCode.toUpperCase()
        )
    ) {
        const recoveryCodeHash =
            hashRecoveryCode(
                normalizedCode.toUpperCase()
            );

        const consumedUser =
            await repository.consumeTwoFactorRecoveryCode(
                user._id.toString(),
                recoveryCodeHash
            );

        if (consumedUser) {
            verified = true;
        }
    }

    if (!verified) {
        const error = new Error(
            'Invalid two-factor authentication code.'
        );
        error.statusCode = 401;
        throw error;
    }

    const token = createToken(user);

    return {
        jwt: token,
        user: sanitizeUser(user),
    };
}

function createToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
        }
    );
}

function sanitizeUser(user) {
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        role: {
            name: user.role,
        },
        provider: user.provider,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

async function loginWithDiscord(discordUser) {
    if (!discordUser?.providerId) {
        const error = new Error(
            'Invalid Discord account information'
        );
        error.statusCode = 400;
        throw error;
    }

    if (!discordUser.email) {
        const error = new Error(
            'Your Discord account does not have an email address available'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = discordUser.email.trim().toLowerCase();

    let user = await repository.findByProviderId(
        'discord',
        discordUser.providerId
    );

    if (user) {
        if (user.isBlocked) {
            const error = new Error(
                'Your account has been blocked'
            );
            error.statusCode = 403;
            throw error;
        }

        return {
            jwt: createToken(user),
            user: sanitizeUser(user),
        };
    }

    user = await repository.findByEmail(normalizedEmail);

    if (user) {
        const error = new Error(
            'An account with this email already exists. Please sign in with your existing login method.'
        );
        error.statusCode = 409;
        throw error;
    }

    user = await repository.create({
        username:
            discordUser.globalName ||
            discordUser.username ||
            normalizedEmail.split('@')[0],

        email: normalizedEmail,

        passwordHash: null,

        firstName: discordUser.firstName || '',
        lastName: discordUser.lastName || '',

        dateOfBirth: null,

        role: 'customer',

        provider: 'discord',

        googleId: discordUser.providerId,

        profileImage: discordUser.picture,

        isEmailVerified: discordUser.emailVerified,

        isBlocked: false,

        twoFactorEnabled: false,
    });

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
    };
}

async function exchangeOAuthHandoffCode(code) {
    const handoff = await consumeHandoffCode(code);

    if (!handoff) {
        const error = new Error(
            'Invalid or expired OAuth login code'
        );
        error.statusCode = 401;
        throw error;
    }

    const user = await repository.findById(handoff.userId);

    if (!user) {
        const error = new Error('User account not found');
        error.statusCode = 401;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
    };
}

async function startTwoFactorSetup(userId) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    const user = await repository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    if (user.twoFactorEnabled) {
        const error = new Error(
            'Two-factor authentication is already enabled.'
        );
        error.statusCode = 400;
        throw error;
    }

    const setup = createMfaSetup(user.email);

    await repository.updateTwoFactorSecret(
        userId,
        {
            twoFactorSecret: setup.secret,
            twoFactorEnabled: false,
        }
    );

    return {
        otpauthUrl: setup.otpauthUrl,
    };
}

async function enableTwoFactor(userId, code) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    const user = await repository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Your account has been blocked');
        error.statusCode = 403;
        throw error;
    }

    if (user.twoFactorEnabled) {
        const error = new Error(
            'Two-factor authentication is already enabled.'
        );
        error.statusCode = 400;
        throw error;
    }

    if (!user.twoFactorSecret) {
        const error = new Error(
            'MFA setup has not been started.'
        );
        error.statusCode = 400;
        throw error;
    }

    const valid = verifyMfaCode({
        secret: user.twoFactorSecret,
        email: user.email,
        code,
    });

    if (!valid) {
        const error = new Error(
            'Invalid authentication code.'
        );
        error.statusCode = 400;
        throw error;
    }

    const {
        codes: recoveryCodes,
        hashes: recoveryCodeHashes,
    } = generateRecoveryCodes();

    await repository.updateTwoFactorRecoveryCodes(
        userId,
        recoveryCodeHashes
    );

    const updatedUser =
        await repository.updateTwoFactorSecret(
            userId,
            {
                twoFactorSecret: user.twoFactorSecret,
                twoFactorEnabled: true,
            }
        );

    if (!updatedUser) {
        const error = new Error(
            'Failed to enable two-factor authentication.'
        );
        error.statusCode = 500;
        throw error;
    }

    return {
        user: sanitizeUser(updatedUser),
        recoveryCodes,
    };
}

async function disableTwoFactor(userId, code) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    const user = await repository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (!user.twoFactorEnabled) {
        const error = new Error(
            'Two-factor authentication is not enabled.'
        );
        error.statusCode = 400;
        throw error;
    }

    const valid = verifyMfaCode({
        secret: user.twoFactorSecret,
        email: user.email,
        code,
    });

    if (!valid) {
        const error = new Error(
            'Invalid authentication code.'
        );
        error.statusCode = 400;
        throw error;
    }

    const updatedUser =
        await repository.clearTwoFactorSecret(userId);

    if (!updatedUser) {
        const error = new Error(
            'Failed to disable two-factor authentication.'
        );
        error.statusCode = 500;
        throw error;
    }

    return sanitizeUser(updatedUser);
}

async function verifyTwoFactorRecoveryCode(
    userId,
    code
) {
    if (!userId) {
        const error = new Error('User ID is required');
        error.statusCode = 401;
        throw error;
    }

    if (
        typeof code !== 'string' ||
        !code.trim()
    ) {
        const error = new Error(
            'Recovery code is required.'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedCode = code
        .trim()
        .toUpperCase();

    if (
        !/^KZ-[A-F0-9]{8}-[A-F0-9]{8}$/.test(
            normalizedCode
        )
    ) {
        const error = new Error(
            'Invalid recovery code format.'
        );
        error.statusCode = 400;
        throw error;
    }

    const user = await repository.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error(
            'Your account has been blocked'
        );
        error.statusCode = 403;
        throw error;
    }

    if (!user.twoFactorEnabled) {
        const error = new Error(
            'Two-factor authentication is not enabled.'
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        !Array.isArray(user.twoFactorRecoveryCodes) ||
        user.twoFactorRecoveryCodes.length === 0
    ) {
        const error = new Error(
            'No recovery codes are available for this account.'
        );
        error.statusCode = 400;
        throw error;
    }

    const recoveryCodeHash =
        hashRecoveryCode(normalizedCode);

    const consumedUser =
        await repository.consumeTwoFactorRecoveryCode(
            userId,
            recoveryCodeHash
        );

    if (!consumedUser) {
        const error = new Error(
            'Invalid or already used recovery code.'
        );
        error.statusCode = 400;
        throw error;
    }

    return {
        success: true,
        remainingRecoveryCodes:
            consumedUser.twoFactorRecoveryCodes.length,
    };
}

module.exports = {
    registerUser,
    requestPasswordReset,
    resetPassword,
    loginUser,
    verifyEmail,
    getCurrentUser,
    updateCurrentUser,
    createMfaChallengeToken,
    verifyMfaChallenge,
    createToken,
    sanitizeUser,
    loginWithGoogle,
    exchangeOAuthHandoffCode,
    loginWithDiscord,
    loginAdmin,
    startTwoFactorSetup,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactorRecoveryCode,
};