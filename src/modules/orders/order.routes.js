'use strict';

const express = require('express');

const controller = require('./order.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

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