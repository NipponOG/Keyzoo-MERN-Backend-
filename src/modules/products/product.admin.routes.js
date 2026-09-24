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
    '/:id/variations',
    requireAdmin,
    controller.addProductVariation
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

router.put(
    '/:id',
    requireAdmin,
    controller.updateProduct
);

router.delete(
    '/:id',
    requireAdmin,
    controller.deleteProduct
);

module.exports = router;