'use strict';

const express = require('express');
const controller = require('./auth.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/verify-email', controller.verifyEmail);
router.post('/forgot-password', controller.requestPasswordReset);
router.post('/reset-password', controller.resetPassword);

router.get('/me', requireAuth, controller.getCurrentUser);
router.patch('/me', requireAuth, controller.updateCurrentUser);

router.post('/2fa/setup', requireAuth, controller.startTwoFactorSetup);
router.post('/2fa/enable', requireAuth, controller.enableTwoFactor);
router.post('/2fa/disable', requireAuth, controller.disableTwoFactor);
router.post('/2fa/recovery', requireAuth, controller.verifyTwoFactorRecoveryCode);
router.post('/2fa/verify', controller.verifyMfaChallenge);

router.get('/google', controller.googleLogin);
router.get('/google/callback', controller.googleCallback);

router.get('/discord', controller.discordLogin);
router.get('/discord/callback', controller.discordCallback);

router.post('/oauth/exchange', controller.exchangeOAuthCode);

module.exports = router;