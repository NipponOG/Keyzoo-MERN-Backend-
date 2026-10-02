'use strict';

const { getDatabase } = require('../../config/database');
const { createUserDocument } = require('./auth.schema');
const { ObjectId } = require('mongodb');

const COLLECTION = 'users';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function findByEmail(email) {
    return getCollection().findOne({
        email: email.toLowerCase(),
    });
}

async function findByGoogleId(googleId) {
    return getCollection().findOne({
        googleId,
    });
}

async function findByProviderId(provider, providerId) {
    return getCollection().findOne({
        provider,
        googleId: providerId,
    });
}

async function findById(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }

    return getCollection().findOne({
        _id: new ObjectId(id),
    });
}

async function updateProfile(
    userId,
    {
        firstName,
        lastName,
        phone,
    }
) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                firstName,
                lastName,
                phone,
                username: `${firstName} ${lastName}`.trim(),
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function create(userData) {
    const document = createUserDocument(userData);

    const result = await getCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId,
    };
}

async function setEmailVerificationToken(
    userId,
    tokenHash,
    expiresAt
) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                emailVerificationTokenHash: tokenHash,
                emailVerificationTokenExpiresAt: expiresAt,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function findByEmailVerificationTokenHash(tokenHash) {
    if (!tokenHash) {
        return null;
    }

    return getCollection().findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationTokenExpiresAt: {
            $gt: new Date(),
        },
        isEmailVerified: false,
    });
}

async function markEmailVerified(userId) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
            isEmailVerified: false,
        },
        {
            $set: {
                isEmailVerified: true,
                updatedAt: new Date(),
            },
            $unset: {
                emailVerificationTokenHash: '',
                emailVerificationTokenExpiresAt: '',
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function setPasswordResetToken(
    userId,
    tokenHash,
    expiresAt
) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                passwordResetTokenHash: tokenHash,
                passwordResetTokenExpiresAt: expiresAt,
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function findByPasswordResetTokenHash(tokenHash) {
    if (!tokenHash) {
        return null;
    }

    return getCollection().findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: {
            $gt: new Date(),
        },
    });
}

async function clearPasswordResetToken(userId) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
        },
        {
            $unset: {
                passwordResetTokenHash: '',
                passwordResetTokenExpiresAt: '',
            },
            $set: {
                updatedAt: new Date(),
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function updatePasswordAndClearResetToken(
    userId,
    passwordHash
) {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    return getCollection().findOneAndUpdate(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                passwordHash,
                updatedAt: new Date(),
            },
            $unset: {
                passwordResetTokenHash: '',
                passwordResetTokenExpiresAt: '',
            },
        },
        {
            returnDocument: 'after',
        }
    );
}

async function ensureIndexes() {
    await getCollection().createIndex(
        { email: 1 },
        { unique: true }
    );

    await getCollection().createIndex(
        { googleId: 1 },
        {
            unique: true,
            sparse: true,
        }
    );

    await getCollection().createIndex(
        { emailVerificationTokenHash: 1 },
        {
            unique: true,
            sparse: true,
        }
    );

    await getCollection().createIndex(
        { passwordResetTokenHash: 1 },
        {
            unique: true,
            sparse: true,
        }
    );
}

module.exports = {
    findByEmail,
    findById,
    updateProfile,
    create,
    ensureIndexes,
    findByGoogleId,
    findByProviderId,
    setEmailVerificationToken,
    findByEmailVerificationTokenHash,
    markEmailVerified,
    setPasswordResetToken,
    findByPasswordResetTokenHash,
    clearPasswordResetToken,
    updatePasswordAndClearResetToken,
};