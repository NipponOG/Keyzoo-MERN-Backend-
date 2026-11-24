'use strict';

const express = require('express');
const controller = require('./wishlist.controller');
const requireAuth = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);
router.get('/', controller.getWishlist);
router.post('/items', controller.addWishlistItem);
router.delete('/items/:itemType/:itemId', controller.removeWishlistItem);

module.exports = router;
