'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const repository = require('./auth.repository');

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

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    createToken,
    sanitizeUser,
};