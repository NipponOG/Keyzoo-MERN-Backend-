'use strict';

const express = require('express');
const controller = require('./game-key.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.post(
    '/',
    requireAdmin,
    controller.uploadGameKeys
);

router.get(
    '/',
    requireAdmin,
    controller.getGameKeysByOwner
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteGameKey
);

module.exports = router;