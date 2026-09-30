'use strict';

const couponService = require('./coupon.service');
const couponRepository = require('./coupon.repository');

async function createCoupon(req, res, next) {
    try {
        const {
            code,
            discountType,
            discountValue,
            maxDiscount,
            minimumOrderAmount,
            isActive,
            startsAt,
            expiresAt,
            usageLimit,
        } = req.body;

        if (
            typeof code !== 'string' ||
            !code.trim()
        ) {
            const error = new Error(
                'Coupon code is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            !['percentage', 'fixed'].includes(
                discountType
            )
        ) {
            const error = new Error(
                'Invalid coupon discount type.'
            );

            error.statusCode = 400;
            throw error;
        }

        const normalizedDiscountValue =
            Number(discountValue);

        if (
            !Number.isFinite(
                normalizedDiscountValue
            ) ||
            normalizedDiscountValue <= 0
        ) {
            const error = new Error(
                'Discount value must be greater than 0.'
            );

            error.statusCode = 400;
            throw error;
        }

        const coupon =
            await couponRepository.create({
                code,
                discountType,
                discountValue:
                    normalizedDiscountValue,
                maxDiscount:
                    maxDiscount === null ||
                        maxDiscount === undefined
                        ? null
                        : Number(maxDiscount),
                minimumOrderAmount:
                    minimumOrderAmount === undefined
                        ? 0
                        : Number(minimumOrderAmount),
                isActive:
                    isActive !== false,
                startsAt:
                    startsAt || null,
                expiresAt:
                    expiresAt || null,
                usageLimit:
                    usageLimit === null ||
                        usageLimit === undefined
                        ? null
                        : Number(usageLimit),
            });

        return res.status(201).json({
            success: true,
            coupon,
        });
    } catch (error) {
        next(error);
    }
}

async function applyCoupon(req, res, next) {
    try {
        const {
            code,
            subtotal,
        } = req.body;

        const result =
            await couponService.validateAndCalculateCoupon({
                code,
                subtotal,
            });

        return res.status(200).json({
            success: true,
            coupon: {
                id: result.couponId,
                code: result.code,
                discountType:
                    result.discountType,
                discountValue:
                    result.discountValue,
            },
            pricing: {
                subtotal: result.subtotal,
                discount: result.discount,
                total: result.total,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCoupon,
    applyCoupon,
};