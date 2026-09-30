'use strict';

const express = require('express');

const couponController = require('./coupon.controller');
const requireAdmin = require('../../modules/admin/admin.middleware');

const router = express.Router();

router.post('/', requireAdmin, couponController.createCoupon);

module.exports = router;