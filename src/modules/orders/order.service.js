'use strict';

const orderRepository = require('./order.repository');

async function getAdminOrders({
    page = 1,
    pageSize = 10,
    search = '',
    status = '',
} = {}) {
    const result = await orderRepository.findAdminOrders({
        page,
        pageSize,
        search,
        status,
    });

    return {
        data: result.orders,
        meta: {
            pagination: {
                page: result.page,
                pageSize: result.pageSize,
                pageCount: result.totalPages,
                total: result.total,
            },
        },
    };
}

async function getOrderById(id) {
    const order = await orderRepository.findById(id);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function getOrderByOrderNumber(orderNumber) {
    const order =
        await orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function createOrder(orderData) {
    return orderRepository.create(orderData);
}

async function updateOrder(id, update) {
    const order =
        await orderRepository.updateById(id, update);

    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function deleteOrder(id) {
    const result =
        await orderRepository.deleteById(id);

    if (!result || result.deletedCount === 0) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    return true;
}

module.exports = {
    getAdminOrders,
    getOrderById,
    getOrderByOrderNumber,
    createOrder,
    updateOrder,
    deleteOrder,
};