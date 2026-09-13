'use strict';

const cloudinary = require('cloudinary').v2;

function getCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
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

function uploadImage(file, options = {}) {
    if (!file || !file.buffer) {
        throw new Error('No image file provided.');
    }

    const client = getCloudinary();

    return new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
            {
                folder: options.folder || 'keyzoo/products',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    publicId: result.public_id,
                    url: result.secure_url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                });
            }
        );

        uploadStream.end(file.buffer);
    });
}

module.exports = {
    uploadImage,
};