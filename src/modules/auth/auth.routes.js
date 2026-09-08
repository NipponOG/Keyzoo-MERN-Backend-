'use strict';

const express = require('express');
const controller = require('./auth.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/me', requireAuth, controller.getCurrentUser);

router.get('/google', controller.googleLogin);
router.get('/google/callback', controller.googleCallback);

router.get('/discord', controller.discordLogin);
router.get('/discord/callback', controller.discordCallback);

router.post('/oauth/exchange', controller.exchangeOAuthCode);

module.exports = router;