'use strict';

const express = require('express');

const controller = require('./payment.controller');
const webhook = require('./stripe/stripe.webhook');

const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post(
    '/stripe/create-checkout',
    requireAuth,
    controller.createStripeCheckout
);

router.post(
    '/stripe/webhook',
    webhook.handleStripeWebhook
);

module.exports = router;