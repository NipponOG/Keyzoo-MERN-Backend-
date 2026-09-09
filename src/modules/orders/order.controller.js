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

module.exports = {
    getAdminOrders,
    getOrderById,
};

