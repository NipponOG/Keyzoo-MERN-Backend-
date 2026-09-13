'use strict';

const { uploadImage } = require('./cloudinary');

async function uploadMedia(file, options = {}) {
    if (!file) {
        throw new Error('No image file provided.');
    }

    return uploadImage(file, options);
}

module.exports = {
    uploadMedia,
};