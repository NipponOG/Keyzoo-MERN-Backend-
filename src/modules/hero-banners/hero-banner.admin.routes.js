'use strict';

const express = require('express');

const controller =
    require('./hero-banner.controller');

const requireAdmin =
    require('../admin/admin.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getAllHeroBanners
);

router.get(
    '/:id',
    requireAdmin,
    controller.getHeroBannerById
);

router.post(
    '/',
    requireAdmin,
    controller.createHeroBanner
);

router.put(
    '/:id',
    requireAdmin,
    controller.updateHeroBanner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteHeroBanner
);

module.exports = router;