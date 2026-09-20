'use strict';

const express = require('express');

const controller = require('./inventory.controller');
const requireAdmin = require('../admin/admin.middleware');

const router = express.Router();

router.delete('/bulk', requireAdmin, controller.bulkDeleteItems);
router.get('/', requireAdmin, controller.getInventory);

module.exports = router;