'use strict';

const express = require('express');

const controller = require('./category-banner.controller');
const maintenanceMiddleware = require('../../middleware/maintenance.middleware');

const router = express.Router();

router.get(
    '/',
    maintenanceMiddleware,
    controller.getPublishedCategoryBanners
);

module.exports = router;