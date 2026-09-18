'use strict';

const express = require('express');

const controller = require('./promo-banner.controller');
const maintenanceMiddleware = require('../../middleware/maintenance.middleware');

const router = express.Router();

router.get(
    '/',
    maintenanceMiddleware,
    controller.getPublishedPromoBanners
);

module.exports = router;