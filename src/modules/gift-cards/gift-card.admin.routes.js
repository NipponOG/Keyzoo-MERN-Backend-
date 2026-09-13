'use strict';

const express = require('express');

const controller = require('./gift-card.controller');

const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.post(
    '/with-variations',
    requireAdmin,
    controller.createGiftCardWithVariations
);

router.post(
    '/',
    requireAdmin,
    controller.createGiftCard
);

router.get(
    '/group/:giftCardGroupId',
    requireAdmin,
    controller.getGiftCardVariations
);

router.get(
    '/:id',
    requireAdmin,
    controller.getGiftCardById
);

module.exports = router;