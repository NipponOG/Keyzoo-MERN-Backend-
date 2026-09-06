'use strict';

const express = require('express');
const controller = require('./game-key.controller');

const router = express.Router();

router.get('/:legacyId', controller.getGameKeyByLegacyId);

module.exports = router;