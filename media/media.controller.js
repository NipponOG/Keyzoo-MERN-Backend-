'use strict';

const mediaService =
    require('./media.service');

async function getUploadSignature(
    req,
    res,
    next
) {
    try {
        const {
            folder,
            publicId,
        } = req.body || {};

        const data =
            mediaService.getUploadSignature({
                folder,
                publicId,
            });

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUploadSignature,
};