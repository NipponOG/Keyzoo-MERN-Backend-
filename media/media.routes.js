'use strict';

const express = require('express');

const controller =
    require('./media.controller');

const requireAdmin =
    require('../admin/admin.middleware');

const router =
    express.Router();

router.post(
    '/signature',
    requireAdmin,
    controller.getUploadSignature
);

module.exports = router;