'use strict';

const cloudinary = require('cloudinary').v2;

function getCloudinary() {
    const cloudName =
        process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
        process.env.CLOUDINARY_API_KEY;

    const apiSecret =
        process.env.CLOUDINARY_API_SECRET;

    if (
        !cloudName ||
        !apiKey ||
        !apiSecret
    ) {
        throw new Error(
            'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
        );
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    return cloudinary;
}

function createUploadSignature({
    folder,
    publicId,
} = {}) {
    const client =
        getCloudinary();

    const timestamp =
        Math.round(Date.now() / 1000);

    const paramsToSign = {
        timestamp,
    };

    if (folder) {
        paramsToSign.folder = folder;
    }

    if (publicId) {
        paramsToSign.public_id =
            publicId;
    }

    const signature =
        client.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

    return {
        cloudName:
            process.env.CLOUDINARY_CLOUD_NAME,

        apiKey:
            process.env.CLOUDINARY_API_KEY,

        timestamp,

        signature,

        folder:
            folder || undefined,

        publicId:
            publicId || undefined,
    };
}

module.exports = {
    createUploadSignature,
};