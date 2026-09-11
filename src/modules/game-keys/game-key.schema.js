'use strict';

/**
 * Game Key document factory
 * This is NOT a MongoDB schema.
 * It creates a consistent game key object before saving.
 */
function createGameKeyDocument(data = {}) {
    const now = new Date();

    return {
        code: data.code ?? '',

        productId: data.productId ?? null,
        giftCardId: data.giftCardId ?? null,

        isAvailable: data.isAvailable ?? true,

        uploadedAt: data.uploadedAt ?? null,
        assignedAt: data.assignedAt ?? null,
        soldAt: data.soldAt ?? null,

        batchId: data.batchId ?? null,
        notes: data.notes ?? null,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createGameKeyDocument,
};