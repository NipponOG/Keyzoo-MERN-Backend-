'use strict';

const express = require('express');
const couponController = require('./coupon.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/apply',
    requireAuth,
    couponController.applyCoupon
);

module.exports = router;