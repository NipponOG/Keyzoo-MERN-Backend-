'use strict';

/**
 * Game Key document factory
 * This is NOT a MongoDB schema.
 * It creates a consistent game key object before saving.
 */
function createGameKeyDocument(data = {}) {
    const now = new Date();

    return {
        legacyId: data.legacyId ?? null,
        legacyDocumentId: data.legacyDocumentId ?? null,

        code: data.code ?? '',

        ownerType: data.ownerType ?? null,
        ownerId: data.ownerId ?? null,

        isAvailable: data.isAvailable ?? true,

        uploadedAt: data.uploadedAt ?? null,
        assignedAt: data.assignedAt ?? null,
        soldAt: data.soldAt ?? null,

        batchId: data.batchId ?? null,
        notes: data.notes ?? null,

        legacyCreatedAt: data.legacyCreatedAt ?? null,
        legacyUpdatedAt: data.legacyUpdatedAt ?? null,

        createdAt: data.createdAt ?? now,
        updatedAt: now,

        migratedAt: data.migratedAt ?? now,
    };
}

module.exports = {
    createGameKeyDocument,
};