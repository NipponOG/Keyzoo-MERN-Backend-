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

router.post(
    '/:id/variations',
    requireAdmin,
    controller.addGiftCardVariation
);

router.get(
    '/:id',
    requireAdmin,
    controller.getGiftCardById
);

router.put(
    '/:id',
    requireAdmin,
    controller.updateGiftCard
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteGiftCard
);

module.exports = router;