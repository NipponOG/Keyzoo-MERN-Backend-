'use strict';

const express = require('express');

const controller = require('./dashboard.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.get('/revenue-chart', requireAdmin, controller.getRevenueChart);
router.get('/category-sales', requireAdmin, controller.getCategorySales);
router.get('/order-chart', requireAdmin, controller.getOrderChart);
router.get('/refunds-chart', requireAdmin, controller.getRefundsChart);

module.exports = router;