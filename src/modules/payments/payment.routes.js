'use strict';

const express = require('express');

const controller = require('./payment.controller');
const webhook = require('./stripe/stripe.webhook');
const cashfreeWebhook = require('./cashfree/cashfree.webhook');

const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/stripe/create-checkout',
    requireAuth,
    controller.createStripeCheckout
);

router.post(
    '/cashfree/create-checkout',
    requireAuth,
    controller.createCashfreeCheckout
);

router.post(
    '/stripe/webhook',
    webhook.handleStripeWebhook
);

router.post(
    '/cashfree/webhook',
    cashfreeWebhook.handleCashfreeWebhook
);

module.exports = router;