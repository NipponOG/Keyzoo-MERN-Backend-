'use strict';

const express = require('express');
const controller = require('./product.controller');

const router = express.Router();

router.get('/:slug', controller.getProductBySlug);

module.exports = router;