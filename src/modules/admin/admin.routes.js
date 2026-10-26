'use strict';

const express = require('express');
const controller = require('./admin.controller');
const requireAdmin = require('./admin.middleware');

const router = express.Router();

router.post('/login', controller.login);
router.post('/passkeys/authentication/options', controller.getPasskeyAuthenticationOptions);
router.post('/passkeys/authentication/verify', controller.verifyPasskeyAuthentication);

router.get('/me', requireAdmin, controller.getCurrentAdmin);

router.get('/login-activity', requireAdmin, controller.getLoginActivity);

router.post('/passkeys/register/options', requireAdmin, controller.getPasskeyRegistrationOptions);
router.post('/passkeys/register/verify', requireAdmin, controller.verifyPasskeyRegistration);
router.get('/passkeys', requireAdmin, controller.getAdminPasskeys);
router.delete('/passkeys/:id', requireAdmin, controller.removeAdminPasskey);

module.exports = router;