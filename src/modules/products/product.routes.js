'use strict';

const express = require('express');
const controller = require('./product.controller');

const router = express.Router();

router.get(
    '/recommended-products',
    controller.getPublishedRecommendedProducts
);

router.get(
    '/best-selling',
    controller.getPublishedBestSellingProducts
);

router.get(
    '/group/:productGroupId',
    controller.getPublishedProductVariations
);

router.get(
    '/:slug',
    controller.getProductBySlug
);

module.exports = router;