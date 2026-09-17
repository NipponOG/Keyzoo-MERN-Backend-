'use strict';

const express = require('express');
const controller = require('./game-banner.controller');
const maintenanceMiddleware = require('../../middleware/maintenance.middleware');

const router = express.Router();

router.get(
    '/',
    maintenanceMiddleware,
    controller.getPublishedGameBanners
);

module.exports = router;