'use strict';

function createCouponDocument(data = {}) {
    const now = new Date();

    return {
        code: data.code ?? '',

        discountType: data.discountType ?? 'percentage',
        discountValue: data.discountValue ?? 0,
        maxDiscount: data.maxDiscount ?? null,

        minimumOrderAmount:
            data.minimumOrderAmount ?? 0,

        isActive: data.isActive ?? true,

        startsAt: data.startsAt ?? null,
        expiresAt: data.expiresAt ?? null,

        usageLimit: data.usageLimit ?? null,
        usageCount: data.usageCount ?? 0,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createCouponDocument,
};