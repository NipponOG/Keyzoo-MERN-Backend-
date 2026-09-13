'use strict';

const express = require('express');

const controller = require('./media.controller');
const upload = require('./upload.middleware');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.post(
    '/upload',
    requireAdmin,
    upload.single('image'),
    controller.uploadMedia
);

module.exports = router;