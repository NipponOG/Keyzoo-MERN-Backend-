'use strict';

const express = require('express');
const controller = require('./game-banner.controller');
const requireAdmin = require('../../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getAllGameBanners
);

router.get(
    '/:id',
    requireAdmin,
    controller.getGameBannerById
);

router.post(
    '/',
    requireAdmin,
    controller.createGameBanner
);

router.put(
    '/:id',
    requireAdmin,
    controller.updateGameBanner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteGameBanner
);

module.exports = router;