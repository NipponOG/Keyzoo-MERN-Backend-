'use strict';

const crypto = require('crypto');

const ticketRepository = require('./ticket.repository');
const orderRepository = require('../orders/order.repository');

const TICKET_CATEGORIES = [
    'key_not_working',
    'wrong_key',
    'key_already_used',
    'activation_problem',
    'region_problem',
    'missing_key',
    'wrong_product',
    'payment_problem',
    'order_problem',
    'other',
];

const TICKET_PRIORITIES = [
    'low',
    'normal',
    'high',
    'urgent',
];

const TICKET_STATUSES = [
    'open',
    'in_progress',
    'waiting_for_customer',
    'resolved',
    'closed',
];

function generateTicketNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase();

    return `KZ-TKT-${timestamp}-${random}`;
}

function normalizeUserId(userId) {
    return userId?.toString() || '';
}

function normalizeItemId(value) {
    return value?.toString() || '';
}

function getOrderItems(order) {
    if (!Array.isArray(order?.cartSnapshot)) {
        return [];
    }

    return order.cartSnapshot;
}

function findPurchasedItem(order, itemType, productId) {
    const normalizedProductId = normalizeItemId(productId);

    return getOrderItems(order).find((item) => {
        const sameType =
            !itemType ||
            item.type === itemType;

        const itemId =
            item.productId ??
            item.product?.id ??
            item.product?._id ??
            item.id ??
            item._id;

        return (
            sameType &&
            normalizeItemId(itemId) === normalizedProductId
        );
    });
}

function validateTicketCategory(category) {
    if (!TICKET_CATEGORIES.includes(category)) {
        const error = new Error('Invalid ticket category.');
        error.statusCode = 400;
        throw error;
    }
}

function validateTicketPriority(priority) {
    if (!TICKET_PRIORITIES.includes(priority)) {
        const error = new Error('Invalid ticket priority.');
        error.statusCode = 400;
        throw error;
    }
}

function validateTicketStatus(status) {
    if (!TICKET_STATUSES.includes(status)) {
        const error = new Error('Invalid ticket status.');
        error.statusCode = 400;
        throw error;
    }
}

function createServiceError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function createTicket({
    userId,
    orderId,
    itemType,
    productId,
    category,
    subject,
    description,
    priority = 'normal',
}) {
    if (!userId) {
        throw createServiceError(
            'Authentication is required.',
            401
        );
    }

    if (!orderId) {
        throw createServiceError(
            'Order ID is required.'
        );
    }

    if (!productId) {
        throw createServiceError(
            'Product ID is required.'
        );
    }

    if (!subject || !subject.trim()) {
        throw createServiceError(
            'Ticket subject is required.'
        );
    }

    if (!description || !description.trim()) {
        throw createServiceError(
            'Ticket description is required.'
        );
    }

    validateTicketCategory(category);
    validateTicketPriority(priority);

    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw createServiceError(
            'Order not found.',
            404
        );
    }

    if (
        normalizeUserId(order.userId) !==
        normalizeUserId(userId)
    ) {
        throw createServiceError(
            'You are not authorized to raise a ticket for this order.',
            403
        );
    }

    const purchasedItem = findPurchasedItem(
        order,
        itemType,
        productId
    );

    if (!purchasedItem) {
        throw createServiceError(
            'The selected item was not found in this order.',
            400
        );
    }

    const itemId =
        purchasedItem.productId ??
        purchasedItem.product?.id ??
        purchasedItem.product?._id ??
        purchasedItem.id ??
        purchasedItem._id;

    const ticket = await ticketRepository.create({
        ticketNumber: generateTicketNumber(),

        userId: normalizeUserId(userId),

        orderId: order._id,
        orderNumber: order.orderNumber,

        item: {
            type:
                purchasedItem.type ??
                itemType ??
                null,

            productId:
                itemId ??
                null,

            title:
                purchasedItem.title ??
                purchasedItem.name ??
                purchasedItem.product?.title ??
                null,

            slug:
                purchasedItem.slug ??
                purchasedItem.product?.slug ??
                null,
        },

        category,
        subject: subject.trim(),
        description: description.trim(),

        priority,
        status: 'open',

        messages: [
            {
                senderType: 'customer',
                senderId: normalizeUserId(userId),
                message: description.trim(),
                createdAt: new Date(),
            },
        ],
    });

    return ticket;
}

async function getTicketForUser(ticketId, userId) {
    if (!userId) {
        throw createServiceError(
            'Authentication is required.',
            401
        );
    }

    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
        throw createServiceError(
            'Ticket not found.',
            404
        );
    }

    if (
        normalizeUserId(ticket.userId) !==
        normalizeUserId(userId)
    ) {
        throw createServiceError(
            'You are not authorized to access this ticket.',
            403
        );
    }

    return ticket;
}

async function getUserTickets(userId, options = {}) {
    if (!userId) {
        throw createServiceError(
            'Authentication is required.',
            401
        );
    }

    return ticketRepository.findByUserId(
        userId,
        options
    );
}

async function getTicketsByOrderForUser(orderId, userId) {
    if (!userId) {
        throw createServiceError(
            'Authentication is required.',
            401
        );
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw createServiceError(
            'Order not found.',
            404
        );
    }

    if (
        normalizeUserId(order.userId) !==
        normalizeUserId(userId)
    ) {
        throw createServiceError(
            'You are not authorized to access this order.',
            403
        );
    }

    return ticketRepository.findByOrderId(orderId);
}

async function addCustomerMessage(
    ticketId,
    userId,
    message
) {
    if (!message || !message.trim()) {
        throw createServiceError(
            'Message is required.'
        );
    }

    const ticket = await getTicketForUser(
        ticketId,
        userId
    );

    if (ticket.status === 'closed') {
        throw createServiceError(
            'This ticket is closed and cannot receive new messages.'
        );
    }

    const newMessage = {
        senderType: 'customer',
        senderId: normalizeUserId(userId),
        message: message.trim(),
        createdAt: new Date(),
    };

    const updatedMessages = [
        ...(ticket.messages || []),
        newMessage,
    ];

    return ticketRepository.updateById(
        ticketId,
        {
            messages: updatedMessages,
            status:
                ticket.status === 'waiting_for_customer'
                    ? 'in_progress'
                    : ticket.status,
        }
    );
}

module.exports = {
    createTicket,
    getTicketForUser,
    getUserTickets,
    getTicketsByOrderForUser,
    addCustomerMessage,

    TICKET_CATEGORIES,
    TICKET_PRIORITIES,
    TICKET_STATUSES,
};