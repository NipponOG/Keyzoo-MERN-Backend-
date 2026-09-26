'use strict';

const orderService = require('./order.service');

async function getAdminOrders(req, res, next) {
    try {
        const {
            page = 1,
            pageSize = 10,
            search = '',
            status = '',
        } = req.query;

        const result = await orderService.getAdminOrders({
            page: Number(page),
            pageSize: Number(pageSize),
            search: search.trim(),
            status: status.trim(),
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

async function getOrderById(req, res, next) {
    try {
        const order = await orderService.getOrderById(
            req.params.id
        );

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
}

async function getMyOrder(req, res, next) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            const error = new Error(
                'Authentication required.'
            );

            error.statusCode = 401;
            throw error;
        }

        const order =
            await orderService.getUserOrderByOrderNumber(
                userId,
                req.params.orderNumber
            );

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
}

async function getMyOrders(req, res, next) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            const error = new Error(
                'Authentication required.'
            );

            error.statusCode = 401;
            throw error;
        }

        const {
            page = 1,
            pageSize = 10,
        } = req.query;

        const result =
            await orderService.getUserOrders({
                userId,
                page: Number(page),
                pageSize: Number(pageSize),
            });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAdminOrders,
    getOrderById,
    getMyOrder,
    getMyOrders,
};

