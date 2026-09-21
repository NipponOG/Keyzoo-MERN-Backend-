'use strict';

const express = require('express');
const controller = require('./ad-banner.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getAdBanners
);

router.get(
    '/:id',
    requireAdmin,
    controller.getAdBannerById
);

router.post(
    '/',
    requireAdmin,
    controller.createAdBanner
);

router.put(
    '/:id',
    requireAdmin,
    controller.updateAdBanner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteAdBanner
);

module.exports = router;