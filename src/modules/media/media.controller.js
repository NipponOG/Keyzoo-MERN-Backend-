'use strict';

const mediaService = require('./media.service');

async function uploadMedia(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image.',
            });
        }

        const { folder } = req.body || {};

        const data = await mediaService.uploadMedia(
            req.file,
            {
                folder,
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Image uploaded successfully.',
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    uploadMedia,
};