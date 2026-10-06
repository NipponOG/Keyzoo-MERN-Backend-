'use strict';

const ticketAdminRepository = require('./ticket.admin.repository');
const {
    TICKET_PRIORITIES,
    TICKET_STATUSES,
} = require('./ticket.service');

function createServiceError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validatePriority(priority) {
    if (!TICKET_PRIORITIES.includes(priority)) {
        throw createServiceError(
            'Invalid ticket priority.'
        );
    }
}

function validateStatus(status) {
    if (!TICKET_STATUSES.includes(status)) {
        throw createServiceError(
            'Invalid ticket status.'
        );
    }
}

function normalizeAttachments(attachments) {
    if (!Array.isArray(attachments)) {
        return [];
    }

    return attachments.map((attachment) => ({
        fileId: attachment.fileId ?? null,
        name: attachment.name ?? null,
        url: attachment.url ?? null,
        thumbnailUrl:
            attachment.thumbnailUrl ?? null,
        filePath: attachment.filePath ?? null,
        mimeType: attachment.mimeType ?? null,
        size: attachment.size ?? 0,
        originalName:
            attachment.originalName ?? null,
    }));
}

async function getAdminTickets(options = {}) {
    return ticketAdminRepository.findAdminTickets(
        options
    );
}

async function getAdminTicket(ticketId) {
    const ticket =
        await ticketAdminRepository.findById(ticketId);

    if (!ticket) {
        throw createServiceError(
            'Ticket not found.',
            404
        );
    }

    return ticket;
}

async function addAdminMessage(
    ticketId,
    adminId,
    message,
    attachments = []
) {
    if (!adminId) {
        throw createServiceError(
            'Authentication is required.',
            401
        );
    }

    if (!message || !message.trim()) {
        throw createServiceError(
            'Message is required.'
        );
    }

    const ticket = await getAdminTicket(ticketId);

    if (ticket.status === 'closed') {
        throw createServiceError(
            'This ticket is closed and cannot receive new messages.'
        );
    }

    const newMessage = {
        senderType: 'admin',
        senderId: adminId.toString(),
        message: message.trim(),
        attachments:
            normalizeAttachments(attachments),
        createdAt: new Date(),
    };

    const messages = [
        ...(ticket.messages || []),
        newMessage,
    ];

    return ticketAdminRepository.updateById(
        ticketId,
        {
            messages,
            status:
                ticket.status === 'open' ||
                    ticket.status === 'waiting_for_customer'
                    ? 'in_progress'
                    : ticket.status,
        }
    );
}

async function updateTicketStatus(
    ticketId,
    status
) {
    validateStatus(status);

    const ticket = await getAdminTicket(ticketId);

    const update = {
        status,
    };

    if (status === 'resolved') {
        update.resolvedAt =
            ticket.resolvedAt || new Date();
    }

    if (status === 'closed') {
        update.closedAt =
            ticket.closedAt || new Date();

        if (!ticket.resolvedAt) {
            update.resolvedAt = new Date();
        }
    }

    if (
        status !== 'resolved' &&
        status !== 'closed'
    ) {
        update.resolvedAt = null;
        update.closedAt = null;
    }

    return ticketAdminRepository.updateById(
        ticketId,
        update
    );
}

async function updateTicketPriority(
    ticketId,
    priority
) {
    validatePriority(priority);

    await getAdminTicket(ticketId);

    return ticketAdminRepository.updateById(
        ticketId,
        {
            priority,
        }
    );
}

async function resolveTicket(
    ticketId,
    resolution
) {
    if (!resolution || !resolution.trim()) {
        throw createServiceError(
            'Resolution is required.'
        );
    }

    await getAdminTicket(ticketId);

    return ticketAdminRepository.updateById(
        ticketId,
        {
            status: 'resolved',
            resolution: resolution.trim(),
            resolvedAt: new Date(),
        }
    );
}

async function closeTicket(ticketId) {
    const ticket = await getAdminTicket(ticketId);

    return ticketAdminRepository.updateById(
        ticketId,
        {
            status: 'closed',
            closedAt:
                ticket.closedAt || new Date(),
            resolvedAt:
                ticket.resolvedAt || new Date(),
        }
    );
}

module.exports = {
    getAdminTickets,
    getAdminTicket,
    addAdminMessage,
    updateTicketStatus,
    updateTicketPriority,
    resolveTicket,
    closeTicket,
};