'use strict';

const express = require('express');

const controller = require('./gift-card.controller');

const router = express.Router();

router.get(
    '/group/:giftCardGroupId',
    controller.getPublishedGiftCardVariations
);

router.get(
    '/:slug',
    controller.getGiftCardBySlug
);

module.exports = router;