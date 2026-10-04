'use strict';

const express = require('express');

const controller = require('./ticket.admin.controller');
const requireAdmin = require('../../modules/admin/admin.middleware');

const router = express.Router();

/*
 * Admin ticket routes
 */

// Ticket list
router.get(
    '/',
    requireAdmin,
    controller.getAdminTickets
);

// Ticket detail
router.get(
    '/:id',
    requireAdmin,
    controller.getAdminTicket
);

// Admin reply
router.post(
    '/:id/messages',
    requireAdmin,
    controller.addAdminMessage
);

// Update status
router.patch(
    '/:id/status',
    requireAdmin,
    controller.updateTicketStatus
);

// Update priority
router.patch(
    '/:id/priority',
    requireAdmin,
    controller.updateTicketPriority
);

// Resolve ticket
router.patch(
    '/:id/resolve',
    requireAdmin,
    controller.resolveTicket
);

// Close ticket
router.patch(
    '/:id/close',
    requireAdmin,
    controller.closeTicket
);

module.exports = router;