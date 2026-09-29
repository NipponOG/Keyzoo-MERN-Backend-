'use strict';

const couponService = require('./coupon.service');

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
    applyCoupon,
};