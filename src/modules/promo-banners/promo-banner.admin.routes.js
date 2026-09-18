'use strict';

const express = require('express');

const controller = require('./promo-banner.controller');
const requireAdmin = require('../../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getAllPromoBanners
);

router.get(
    '/:id',
    requireAdmin,
    controller.getPromoBannerById
);

router.post(
    '/',
    requireAdmin,
    controller.createPromoBanner
);

router.put(
    '/:id',
    requireAdmin,
    controller.updatePromoBanner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deletePromoBanner
);

module.exports = router;