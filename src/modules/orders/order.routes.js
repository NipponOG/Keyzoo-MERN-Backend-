'use strict';

const express = require('express');

const controller = require('./order.controller');

const requireAuth = require('../../middleware/auth.middleware');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

/*
 * Customer order lookup
 *
 * Must come before /:id so "my/:orderNumber"
 * is handled by this route.
 */

router.get(
    '/my',
    requireAuth,
    controller.getMyOrders
);

router.get(
    '/my/:orderNumber',
    requireAuth,
    controller.getMyOrder
);

/*
 * Admin order endpoints
 */
router.get(
    '/',
    requireAdmin,
    controller.getAdminOrders
);

router.get(
    '/:id',
    requireAdmin,
    controller.getOrderById
);

module.exports = router;