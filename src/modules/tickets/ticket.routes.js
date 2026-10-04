'use strict';

const express = require('express');

const controller = require('./ticket.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

/*
 * Customer ticket routes
 */

// Create a new support ticket
router.post(
    '/',
    requireAuth,
    controller.createTicket
);

// Get logged-in customer's tickets
router.get(
    '/',
    requireAuth,
    controller.getMyTickets
);

// Get tickets belonging to a specific order
router.get(
    '/order/:orderId',
    requireAuth,
    controller.getMyOrderTickets
);

// Get one specific ticket
router.get(
    '/:id',
    requireAuth,
    controller.getMyTicket
);

// Customer reply
router.post(
    '/:id/messages',
    requireAuth,
    controller.addCustomerMessage
);

module.exports = router;