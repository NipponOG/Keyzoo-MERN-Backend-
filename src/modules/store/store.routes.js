'use strict';

const express = require('express');
const storeController = require('./store.controller');

const router = express.Router();

router.get('/', storeController.getStoreItems);
router.get('/filter-options', storeController.getStoreFilterOptions);

module.exports = router;
