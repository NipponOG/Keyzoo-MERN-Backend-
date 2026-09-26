'use strict';

const crypto = require('crypto');

const orderRepository = require('./order.repository');

const productRepository = require('../products/product.repository');
const giftCardRepository = require('../gift-cards/gift-card.repository');
const gameKeyRepository = require('../game-keys/game-key.repository');

function createOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();

    const random = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase();

    return `KZ-${timestamp}-${random}`;
}

function getEffectivePrice(item) {
    const discountPrice = Number(item.discountPrice);
    const price = Number(item.price);

    if (
        Number.isFinite(discountPrice) &&
        discountPrice > 0
    ) {
        return discountPrice;
    }

    if (
        Number.isFinite(price) &&
        price > 0
    ) {
        return price;
    }

    return 0;
}

function validateQuantity(quantity) {
    const normalizedQuantity = Number(quantity);

    if (
        !Number.isInteger(normalizedQuantity) ||
        normalizedQuantity < 1
    ) {
        const error = new Error(
            'Quantity must be a positive integer.'
        );

        error.statusCode = 400;
        throw error;
    }

    return normalizedQuantity;
}

async function findCheckoutItem(itemId) {
    const product =
        await productRepository.findById(itemId);

    if (product) {
        return product;
    }

    const giftCard =
        await giftCardRepository.findById(itemId);

    if (giftCard) {
        return giftCard;
    }

    const error = new Error(
        'One or more checkout items could not be found.'
    );

    error.statusCode = 404;
    throw error;
}

async function getAvailableKeyCount(item) {
    if (item.type === 'product') {
        return gameKeyRepository
            .countAvailableProductKeys(
                item._id.toString()
            );
    }

    if (item.type === 'gift-card') {
        return gameKeyRepository
            .countAvailableGiftCardKeys(
                item._id.toString()
            );
    }

    return 0;
}

async function createPendingOrder({
    userId,
    items,
    deliveryEmail,
    currency,
}) {
    if (!userId) {
        const error = new Error(
            'Authenticated user is required.'
        );

        error.statusCode = 401;
        throw error;
    }

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

    if (!deliveryEmail) {
        const error = new Error(
            'Delivery email is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedCurrency =
        typeof currency === 'string'
            ? currency.trim().toUpperCase()
            : '';

    if (!normalizedCurrency) {
        const error = new Error(
            'Currency is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    const cartSnapshot = [];

    let totalAmount = 0;
    let totalKeysRequired = 0;

    for (const cartItem of items) {
        if (!cartItem?.id) {
            const error = new Error(
                'Each checkout item must contain a valid SKU ID.'
            );

            error.statusCode = 400;
            throw error;
        }

        const quantity =
            validateQuantity(cartItem.quantity);

        const item =
            await findCheckoutItem(cartItem.id);

        if (item.status !== 'published') {
            const error = new Error(
                `"${item.title}" is not currently available for purchase.`
            );

            error.statusCode = 409;
            throw error;
        }

        if (item.available !== true) {
            const error = new Error(
                `"${item.title}" is currently unavailable.`
            );

            error.statusCode = 409;
            throw error;
        }

        if (
            item.currency &&
            item.currency.toUpperCase() !==
            normalizedCurrency
        ) {
            const error = new Error(
                `"${item.title}" uses ${item.currency}, not ${normalizedCurrency}.`
            );

            error.statusCode = 400;
            throw error;
        }

        const unitPrice =
            getEffectivePrice(item);

        if (unitPrice <= 0) {
            const error = new Error(
                `"${item.title}" does not have a valid price.`
            );

            error.statusCode = 409;
            throw error;
        }

        const availableKeys =
            await getAvailableKeyCount(item);

        if (availableKeys < quantity) {
            const error = new Error(
                `Not enough keys available for "${item.title}".`
            );

            error.statusCode = 409;
            throw error;
        }

        const subtotal =
            unitPrice * quantity;

        totalAmount += subtotal;
        totalKeysRequired += quantity;

        cartSnapshot.push({
            id: item._id,
            type: item.type,

            title: item.title,
            slug: item.slug ?? null,

            quantity,

            unitPrice,
            subtotal,

            currency: item.currency,

            region: item.region ?? null,
            var_title: item.var_title ?? null,

            image: item.image ?? null,
        });
    }

    if (totalAmount <= 0) {
        const error = new Error(
            'Order total must be greater than zero.'
        );

        error.statusCode = 400;
        throw error;
    }

    const orderNumber =
        createOrderNumber();

    const order =
        await orderRepository.create({
            orderNumber,

            totalAmount,
            currency: normalizedCurrency,

            paymentMethod: null,
            paymentProvider: null,

            paymentStatus: 'pending',

            deliveryEmail,

            status: 'processing',
            deliveryStatus: 'pending',

            gameKeysAssigned: false,
            deliveredAt: null,

            cartSnapshot,

            userId,

            assignedKeys: [],

            manualDeliveryRequired: false,

            totalKeysRequired,
            totalKeysAssigned: 0,

            notes: null,
        });

    return order;
}

async function getAdminOrders({
    page = 1,
    pageSize = 10,
    search = '',
    status = '',
} = {}) {
    const result =
        await orderRepository.findAdminOrders({
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
    const order =
        await orderRepository.findById(id);

    if (!order) {
        const error = new Error(
            'Order not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function getOrderByOrderNumber(orderNumber) {
    const order =
        await orderRepository.findByOrderNumber(
            orderNumber
        );

    if (!order) {
        const error = new Error(
            'Order not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function createOrder(orderData) {
    return orderRepository.create(
        orderData
    );
}

async function updateOrder(id, update) {
    const order =
        await orderRepository.updateById(
            id,
            update
        );

    if (!order) {
        const error = new Error(
            'Order not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function deleteOrder(id) {
    const result =
        await orderRepository.deleteById(id);

    if (
        !result ||
        result.deletedCount === 0
    ) {
        const error = new Error(
            'Order not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return true;
}

async function updateOrderByOrderNumber(
    orderNumber,
    update
) {
    const order =
        await orderRepository.updateByOrderNumber(
            orderNumber,
            update
        );

    if (!order) {
        const error = new Error(
            'Order not found'
        );

        error.statusCode = 404;
        throw error;
    }

    return order;
}

async function getUserOrderByOrderNumber(
    userId,
    orderNumber
) {
    if (!userId) {
        const error = new Error(
            'Authenticated user is required.'
        );

        error.statusCode = 401;
        throw error;
    }

    if (!orderNumber) {
        const error = new Error(
            'Order number is required.'
        );

        error.statusCode = 400;
        throw error;
    }

    const order =
        await orderRepository
            .findByOrderNumber(orderNumber);

    if (!order) {
        const error = new Error(
            'Order not found.'
        );

        error.statusCode = 404;
        throw error;
    }

    /*
     * Customers may only access their own orders.
     */
    if (
        !order.userId ||
        order.userId.toString() !==
        userId.toString()
    ) {
        const error = new Error(
            'Order not found.'
        );

        error.statusCode = 404;
        throw error;
    }

    /*
     * Only expose game keys after payment has been
     * confirmed and fulfillment has completed.
     */
    const keysAreAvailable =
        order.paymentStatus === 'paid' &&
        order.gameKeysAssigned === true &&
        order.deliveryStatus === 'ready';

    const keys = keysAreAvailable
        ? (order.assignedKeys || []).map(
            (assignedKey) => ({
                keyId:
                    assignedKey.keyId
                        ?.toString?.() ??
                    assignedKey.keyId,

                code: assignedKey.code,

                itemId:
                    assignedKey.itemId
                        ?.toString?.() ??
                    assignedKey.itemId,

                itemType:
                    assignedKey.itemType,

                title:
                    assignedKey.title,

                quantityIndex:
                    assignedKey.quantityIndex,
            })
        )
        : [];

    return {
        orderNumber:
            order.orderNumber,

        totalAmount:
            order.totalAmount,

        currency:
            order.currency,

        paymentMethod:
            order.paymentMethod,

        paymentProvider:
            order.paymentProvider,

        paymentStatus:
            order.paymentStatus,

        deliveryEmail:
            order.deliveryEmail,

        status:
            order.status,

        deliveryStatus:
            order.deliveryStatus,

        deliveredAt:
            order.deliveredAt,

        items:
            (order.cartSnapshot || []).map(
                (item) => ({
                    id:
                        item.id
                            ?.toString?.() ??
                        item.id,

                    type:
                        item.type,

                    title:
                        item.title,

                    slug:
                        item.slug,

                    quantity:
                        item.quantity,

                    unitPrice:
                        item.unitPrice,

                    subtotal:
                        item.subtotal,

                    currency:
                        item.currency,

                    region:
                        item.region,

                    var_title:
                        item.var_title,

                    image:
                        item.image,
                })
            ),

        keys,
    };
}

module.exports = {
    createPendingOrder,

    getAdminOrders,
    getOrderById,
    getOrderByOrderNumber,
    getUserOrderByOrderNumber,

    createOrder,
    updateOrder,
    updateOrderByOrderNumber,
    deleteOrder,
};