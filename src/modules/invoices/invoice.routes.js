'use strict';

const express = require('express');

const requireAuth = require('../../middleware/auth.middleware');
const invoiceController = require('./invoice.controller');

const router = express.Router();

router.get(
    '/:orderNumber',
    requireAuth,
    invoiceController.downloadInvoice
);

module.exports = router;