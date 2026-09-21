'use strict';

const express = require('express');
const controller = require('./newsletter.controller');

const router = express.Router();

router.post('/subscribe', controller.subscribe);

module.exports = router;