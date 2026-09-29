'use strict';

const couponRepository = require('./coupon.repository');

function normalizeCode(code) {
    if (
        typeof code !== 'string' ||
        !code.trim()
    ) {
        return '';
    }

    return code.trim().toUpperCase();
}

function calculateDiscount({
    coupon,
    subtotal,
}) {
    const amount = Number(subtotal);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        const error = new Error(
            'Invalid order amount.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (coupon.discountType === 'percentage') {
        let discount =
            amount *
            (Number(coupon.discountValue) / 100);

        if (
            coupon.maxDiscount !== null &&
            coupon.maxDiscount !== undefined
        ) {
            discount = Math.min(
                discount,
                Number(coupon.maxDiscount)
            );
        }

        return Math.min(discount, amount);
    }

    if (coupon.discountType === 'fixed') {
        return Math.min(
            Number(coupon.discountValue),
            amount
        );
    }

    const error = new Error(
        'Unsupported coupon discount type.'
    );

    error.statusCode = 500;
    throw error;
}

async function validateAndCalculateCoupon({
    code,
    subtotal,
}) {
    const normalizedCode =
        normalizeCode(code);

    if (!normalizedCode) {
        const error = new Error(
            'Please enter a coupon code.'
        );

        error.statusCode = 400;
        throw error;
    }

    const coupon =
        await couponRepository.findByCode(
            normalizedCode
        );

    if (!coupon) {
        const error = new Error(
            'Invalid coupon code.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (coupon.isActive !== true) {
        const error = new Error(
            'This coupon is no longer active.'
        );

        error.statusCode = 400;
        throw error;
    }

    const now = new Date();

    if (
        coupon.startsAt &&
        new Date(coupon.startsAt) > now
    ) {
        const error = new Error(
            'This coupon is not active yet.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        coupon.expiresAt &&
        new Date(coupon.expiresAt) < now
    ) {
        const error = new Error(
            'This coupon has expired.'
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined &&
        Number(coupon.usageCount) >=
        Number(coupon.usageLimit)
    ) {
        const error = new Error(
            'This coupon has reached its usage limit.'
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedSubtotal =
        Number(subtotal);

    if (
        !Number.isFinite(
            normalizedSubtotal
        ) ||
        normalizedSubtotal <= 0
    ) {
        const error = new Error(
            'Invalid order amount.'
        );

        error.statusCode = 400;
        throw error;
    }

    const minimumOrderAmount =
        Number(
            coupon.minimumOrderAmount || 0
        );

    if (
        normalizedSubtotal <
        minimumOrderAmount
    ) {
        const error = new Error(
            `Minimum order amount for this coupon is ${minimumOrderAmount}.`
        );

        error.statusCode = 400;
        throw error;
    }

    const discount =
        calculateDiscount({
            coupon,
            subtotal:
                normalizedSubtotal,
        });

    const total =
        Math.max(
            0,
            normalizedSubtotal -
            discount
        );

    return {
        couponId: coupon._id,
        code: coupon.code,
        discountType:
            coupon.discountType,
        discountValue:
            coupon.discountValue,
        subtotal:
            normalizedSubtotal,
        discount,
        total,
    };
}

module.exports = {
    validateAndCalculateCoupon,
};