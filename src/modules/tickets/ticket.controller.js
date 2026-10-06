'use strict';

const ticketService = require('./ticket.service');

async function createTicket(req, res, next) {
    try {
        const userId = req.user?.userId;

        const {
            orderId,
            itemType,
            productId,
            category,
            subject,
            description,
            priority,
            attachments,
        } = req.body || {};

        const ticket = await ticketService.createTicket({
            userId,
            orderId,
            itemType,
            productId,
            category,
            subject,
            description,
            priority,
            attachments,
        });

        return res.status(201).json({
            success: true,
            message: 'Support ticket created successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function getMyTickets(req, res, next) {
    try {
        const userId = req.user?.userId;

        const {
            page = 1,
            pageSize = 20,
        } = req.query || {};

        const result = await ticketService.getUserTickets(
            userId,
            {
                page,
                pageSize,
            }
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function getMyTicket(req, res, next) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const ticket =
            await ticketService.getTicketForUser(
                id,
                userId
            );

        return res.json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

async function getMyOrderTickets(req, res, next) {
    try {
        const userId = req.user?.userId;
        const { orderId } = req.params;

        const tickets =
            await ticketService.getTicketsByOrderForUser(
                orderId,
                userId
            );

        return res.json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        next(error);
    }
}

async function addCustomerMessage(req, res, next) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const {
            message,
            attachments,
        } = req.body || {};

        const ticket =
            await ticketService.addCustomerMessage(
                id,
                userId,
                message,
                attachments
            );

        return res.json({
            success: true,
            message: 'Message added successfully.',
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTicket,
    getMyTickets,
    getMyTicket,
    getMyOrderTickets,
    addCustomerMessage,
};