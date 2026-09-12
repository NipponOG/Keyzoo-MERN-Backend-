'use strict';

const express = require('express');

const controller = require('./game-key.controller');

const router = express.Router();

router.get(
    '/',
    controller.getGameKeysByOwner
);

router.patch(
    '/assign',
    controller.assignAvailableGameKey
);

module.exports = router;