'use strict';

const express = require('express');
const controller = require('./auth.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/me', requireAuth, controller.getCurrentUser);

module.exports = router;