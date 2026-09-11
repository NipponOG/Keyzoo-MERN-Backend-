'use strict';

const express = require('express');

const controller = require('./game-key.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.get(
    '/',
    requireAdmin,
    controller.getGameKeysByOwner
);

router.post(
    '/',
    requireAdmin,
    controller.uploadGameKeys
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteGameKey
);

module.exports = router;