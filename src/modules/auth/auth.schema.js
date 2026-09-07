'use strict';

/**
 * User document factory
 * This is NOT a MongoDB schema.
 * It creates a consistent user object before saving.
 */
function createUserDocument(data = {}) {
    const now = new Date();

    return {
        username: data.username ?? '',
        email: data.email ?? '',

        passwordHash: data.passwordHash ?? null,

        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',

        dateOfBirth: data.dateOfBirth ?? null,

        role: data.role ?? 'customer',
        provider: data.provider ?? 'local',

        isEmailVerified: data.isEmailVerified ?? false,
        isBlocked: data.isBlocked ?? false,

        twoFactorEnabled: data.twoFactorEnabled ?? false,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createUserDocument,
};