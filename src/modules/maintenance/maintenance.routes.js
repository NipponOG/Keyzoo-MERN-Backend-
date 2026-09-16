'use strict';

const express = require('express');

const controller =
    require('./maintenance.controller');

const requireAdmin =
    require('../admin/admin.middleware');

const router = express.Router();

router.get(
    '/status',
    controller.getStatus
);

router.put(
    '/status',
    requireAdmin,
    controller.updateStatus
);

module.exports = router;