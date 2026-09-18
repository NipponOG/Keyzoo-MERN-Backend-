'use strict';

const express = require('express');

const controller = require('./category-banner.controller');
const requireAdmin = require('../../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getAllCategoryBanners
);

router.get(
    '/:id',
    requireAdmin,
    controller.getCategoryBannerById
);

router.post(
    '/',
    requireAdmin,
    controller.createCategoryBanner
);

router.put(
    '/:id',
    requireAdmin,
    controller.updateCategoryBanner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteCategoryBanner
);

module.exports = router;