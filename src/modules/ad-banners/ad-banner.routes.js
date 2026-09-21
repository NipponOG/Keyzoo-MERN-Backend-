'use strict';

const express = require('express');
const controller = require('./ad-banner.controller');

const router = express.Router();

router.get(
    '/',
    controller.getPublishedAdBanners
);

module.exports = router;