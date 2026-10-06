'use strict';

const express = require('express');

const requireAuth = require('../../middleware/auth.middleware');
const imagekitService = require('../../services/imagekit.service');
const uploadMiddleware = require('./upload.middleware');
const uploadController = require('./upload.controller');

const router = express.Router();

router.get('/auth', requireAuth, (req, res, next) => {
    try {
        const authentication =
            imagekitService.getUploadAuthentication();

        return res.json({
            success: true,
            data: authentication,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/attachments',
    requireAuth,
    uploadMiddleware.upload.array('attachments', 5),
    uploadController.uploadAttachments
);

module.exports = router;