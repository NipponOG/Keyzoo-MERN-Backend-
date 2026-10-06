'use strict';

const imagekitService = require('../../services/imagekit.service');

async function uploadAttachments(req, res, next) {
    try {
        const files = req.files || [];

        if (!files.length) {
            const error = new Error(
                'At least one attachment is required.'
            );

            error.statusCode = 400;

            throw error;
        }

        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const uploaded =
                    await imagekitService.uploadFile({
                        file: file.buffer,
                        fileName: file.originalname,
                        folder: 'keyzoo/ticket-attachments',
                        tags: [
                            'keyzoo',
                            'ticket-attachment',
                        ],
                    });

                return {
                    ...uploaded,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                };
            })
        );

        return res.status(201).json({
            success: true,
            message: 'Attachments uploaded successfully.',
            data: uploadedFiles,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    uploadAttachments,
};