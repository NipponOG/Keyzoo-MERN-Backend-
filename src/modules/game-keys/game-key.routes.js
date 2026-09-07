'use strict';

const express = require('express');
const controller = require('./game-key.controller');

const router = express.Router();

// router.get('/:legacyId', controller.getGameKeyByLegacyId);   Not needed as we are not using this endpoint in the frontend, but can be used for testing purposes

router.patch(
    '/assign/:ownerType/:ownerId',
    controller.assignAvailableGameKey
);

module.exports = router;