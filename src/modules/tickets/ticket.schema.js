'use strict';

function createTicketDocument(data = {}) {
    const now = new Date();

    return {
        ticketNumber: data.ticketNumber ?? '',

        // Customer
        userId: data.userId ?? null,

        // Related order
        orderId: data.orderId ?? null,
        orderNumber: data.orderNumber ?? null,

        // Related purchased item
        item: data.item ?? {
            type: null,
            productId: null,
            title: null,
            slug: null,
        },

        // Ticket information
        category: data.category ?? 'other',
        subject: data.subject ?? '',
        description: data.description ?? '',

        priority: data.priority ?? 'normal',
        status: data.status ?? 'open',

        // Conversation
        messages: data.messages ?? [],

        // Resolution
        resolution: data.resolution ?? null,

        resolvedAt: data.resolvedAt ?? null,
        closedAt: data.closedAt ?? null,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createTicketDocument,
};