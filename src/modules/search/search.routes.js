'use strict';

const express = require('express');
const controller = require('./search.controller');

const router = express.Router();

router.get('/live', controller.liveSearch);

module.exports = router;