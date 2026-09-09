'use strict';

const express = require('express');
const controller = require('./admin.controller');
const requireAdmin = require('./admin.middleware');

const router = express.Router();

router.post('/login', controller.login);

router.get('/me', requireAdmin, controller.getCurrentAdmin);

module.exports = router;