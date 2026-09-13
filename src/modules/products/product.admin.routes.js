'use strict';

const express = require('express');

const controller = require('./product.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.post(
    '/with-variations',
    requireAdmin,
    controller.createProductWithVariations
);

router.post(
    '/',
    requireAdmin,
    controller.createProduct
);

router.get(
    '/group/:productGroupId',
    requireAdmin,
    controller.getProductVariations
);

router.get(
    '/:id',
    requireAdmin,
    controller.getProductById
);

module.exports = router;