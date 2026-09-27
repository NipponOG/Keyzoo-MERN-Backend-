'use strict';

const paymentService = require('./payment.service');
const orderService = require('../orders/order.service');
const authRepository = require('../auth/auth.repository');

async function createStripeCheckout(req, res, next) {
    try {
        const {
            items,
            currency,
        } = req.body || {};

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            const error = new Error(
                'Checkout items are required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            typeof currency !== 'string' ||
            !currency.trim()
        ) {
            const error = new Error(
                'Currency is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        const userId = req.user?.userId;

        if (!userId) {
            const error = new Error(
                'Authentication required.'
            );

            error.statusCode = 401;
            throw error;
        }

        const user =
            await authRepository.findById(userId);

        if (!user) {
            const error = new Error(
                'User account not found.'
            );

            error.statusCode = 401;
            throw error;
        }

        if (user.isBlocked) {
            const error = new Error(
                'Your account has been blocked.'
            );

            error.statusCode = 403;
            throw error;
        }

        if (!user.email) {
            const error = new Error(
                'Your account does not have a valid email address.'
            );

            error.statusCode = 400;
            throw error;
        }

        const frontendUrl =
            process.env.FRONTEND_URL ||
            'http://localhost:3000';

        const pendingOrder =
            await orderService.createPendingOrder({
                userId,
                items,
                deliveryEmail: user.email,
                currency,
            });

        try {
            const checkout =
                await paymentService.createStripeCheckout({
                    orderNumber:
                        pendingOrder.orderNumber,

                    amount:
                        pendingOrder.totalAmount,

                    currency:
                        pendingOrder.currency,

                    customerEmail:
                        user.email,

                    successUrl:
                        `${frontendUrl}/checkout/success?order=${encodeURIComponent(
                            pendingOrder.orderNumber
                        )}`,

                    cancelUrl:
                        `${frontendUrl}/checkout?payment=cancelled&order=${encodeURIComponent(
                            pendingOrder.orderNumber
                        )}`,

                    metadata: {
                        orderNumber:
                            pendingOrder.orderNumber,

                        userId:
                            userId.toString(),
                    },
                });

            res.status(201).json({
                success: true,

                order: {
                    id:
                        pendingOrder._id,

                    orderNumber:
                        pendingOrder.orderNumber,

                    totalAmount:
                        pendingOrder.totalAmount,

                    currency:
                        pendingOrder.currency,

                    paymentStatus:
                        pendingOrder.paymentStatus,
                },

                checkout,
            });
        } catch (paymentError) {
            // Payment session creation failed.
            // The pending order must not remain silently active.

            try {
                await orderService.updateOrderByOrderNumber(
                    pendingOrder.orderNumber,
                    {
                        status: 'cancelled',
                        paymentStatus: 'failed',
                    }
                );
            } catch (updateError) {
                console.error(
                    'Failed to cancel pending order after payment creation error:',
                    updateError
                );
            }

            throw paymentError;
        }
    } catch (error) {
        next(error);
    }
}

async function createCashfreeCheckout(req, res, next) {
    try {
        const {
            items,
            currency,
        } = req.body || {};

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {
            const error = new Error(
                'Checkout items are required.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            typeof currency !== 'string' ||
            !currency.trim()
        ) {
            const error = new Error(
                'Currency is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        const userId = req.user?.userId;

        if (!userId) {
            const error = new Error(
                'Authentication required.'
            );

            error.statusCode = 401;
            throw error;
        }

        const user =
            await authRepository.findById(userId);

        if (!user) {
            const error = new Error(
                'User account not found.'
            );

            error.statusCode = 401;
            throw error;
        }

        if (user.isBlocked) {
            const error = new Error(
                'Your account has been blocked.'
            );

            error.statusCode = 403;
            throw error;
        }

        if (!user.email) {
            const error = new Error(
                'Your account does not have a valid email address.'
            );

            error.statusCode = 400;
            throw error;
        }

        if (!user.phone) {
            const error = new Error(
                'Your account does not have a valid phone number for Cashfree payment.'
            );

            error.statusCode = 400;
            throw error;
        }

        const frontendUrl =
            process.env.FRONTEND_URL ||
            'http://localhost:3000';

        const backendUrl =
            process.env.BACKEND_URL ||
            'http://localhost:5000';

        const pendingOrder =
            await orderService.createPendingOrder({
                userId,
                items,
                deliveryEmail: user.email,
                currency,
            });

        try {
            const cashfree =
                await paymentService.createCashfreeCheckout({
                    orderNumber:
                        pendingOrder.orderNumber,

                    amount:
                        pendingOrder.totalAmount,

                    currency:
                        pendingOrder.currency,

                    customerId:
                        userId.toString(),

                    customerEmail:
                        user.email,

                    customerPhone:
                        user.phone,

                    returnUrl:
                        `${frontendUrl}/checkout/success?order=${encodeURIComponent(
                            pendingOrder.orderNumber
                        )}`,

                    notifyUrl:
                        `${backendUrl}/api/v1/payments/cashfree/webhook`,
                });

            const updatedOrder =
                await orderService.updateOrderByOrderNumber(
                    pendingOrder.orderNumber,
                    {
                        cashfreeOrderId:
                            cashfree.orderId,
                    }
                );

            if (!updatedOrder) {
                const error = new Error(
                    'Failed to save Cashfree order information.'
                );

                error.statusCode = 500;
                throw error;
            }

            return res.status(201).json({
                success: true,

                order: {
                    id:
                        pendingOrder._id,

                    orderNumber:
                        pendingOrder.orderNumber,

                    totalAmount:
                        pendingOrder.totalAmount,

                    currency:
                        pendingOrder.currency,

                    paymentStatus:
                        pendingOrder.paymentStatus,
                },

                checkout: {
                    paymentSessionId:
                        cashfree.paymentSessionId,

                    orderId:
                        cashfree.orderId,

                    orderStatus:
                        cashfree.orderStatus,
                },
            });
        } catch (paymentError) {
            try {
                await orderService.updateOrderByOrderNumber(
                    pendingOrder.orderNumber,
                    {
                        status: 'cancelled',
                        paymentStatus: 'failed',
                    }
                );
            } catch (updateError) {
                console.error(
                    'Failed to cancel pending order after Cashfree payment creation error:',
                    updateError
                );
            }

            throw paymentError;
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createStripeCheckout,
    createCashfreeCheckout,
};