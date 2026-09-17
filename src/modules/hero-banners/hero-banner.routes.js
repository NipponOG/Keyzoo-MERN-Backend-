'use strict';

const express = require('express');

const controller =
    require('./hero-banner.controller');

const maintenanceMiddleware =
    require('../../middleware/maintenance.middleware');

const router = express.Router();

router.get(
    '/',
    maintenanceMiddleware,
    controller.getPublishedHeroBanners
);

module.exports = router;