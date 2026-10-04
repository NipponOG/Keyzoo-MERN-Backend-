'use strict';

const ticketAdminService = require('./ticket.admin.service');

async function getAdminTickets(req, res, next) {
    try {
        const {
            page = 1,
            pageSize = 20,
            search = '',
            status = '',
            priority = '',
            category = '',
        } = req.query || {};

        const result =
            await ticketAdminService.getAdminTickets({
                page,
                pageSize,
                search,
                status,
                priority,
                category,
            });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function getAdminTicket(req, res, next) {
    try {
        const { id } = req.params;

        const ticket =
            await ticketAdminService.getAdminTicket(id);

        return res.json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function addAdminMessage(req, res, next) {
    try {
        const adminId = req.user?.userId;
        const { id } = req.params;
        const { message } = req.body || {};

        const ticket =
            await ticketAdminService.addAdminMessage(
                id,
                adminId,
                message
            );

        return res.json({
            success: true,
            message: 'Admin message added successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function updateTicketStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        const ticket =
            await ticketAdminService.updateTicketStatus(
                id,
                status
            );

        return res.json({
            success: true,
            message: 'Ticket status updated successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function updateTicketPriority(req, res, next) {
    try {
        const { id } = req.params;
        const { priority } = req.body || {};

        const ticket =
            await ticketAdminService.updateTicketPriority(
                id,
                priority
            );

        return res.json({
            success: true,
            message: 'Ticket priority updated successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function resolveTicket(req, res, next) {
    try {
        const { id } = req.params;
        const { resolution } = req.body || {};

        const ticket =
            await ticketAdminService.resolveTicket(
                id,
                resolution
            );

        return res.json({
            success: true,
            message: 'Ticket resolved successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function closeTicket(req, res, next) {
    try {
        const { id } = req.params;

        const ticket =
            await ticketAdminService.closeTicket(id);

        return res.json({
            success: true,
            message: 'Ticket closed successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
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