'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const repository = require('./auth.repository');
const { consumeHandoffCode, } = require('./oauth-handoff.service');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function registerUser({
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
}) {
    if (!firstName || !lastName || !email || !password) {
        const error = new Error(
            'First name, last name, email and password are required'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

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

    return {
        jwt: createToken(user),
        user: sanitizeUser(user),
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
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const token = createToken(user);

    return {
        jwt: token,
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

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    createToken,
    sanitizeUser,
    loginWithGoogle,
    exchangeOAuthHandoffCode,
    loginWithDiscord,
};