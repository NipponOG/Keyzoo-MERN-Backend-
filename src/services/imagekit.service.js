'use strict';

const ImageKit = require('@imagekit/nodejs');

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

if (!privateKey) {
    throw new Error(
        'IMAGEKIT_PRIVATE_KEY is not configured.'
    );
}

if (!publicKey) {
    throw new Error(
        'IMAGEKIT_PUBLIC_KEY is not configured.'
    );
}

const imagekit = new ImageKit({
    privateKey,
});

function getUploadAuthentication() {
    const {
        token,
        expire,
        signature,
    } = imagekit.helper.getAuthenticationParameters();

    return {
        token,
        expire,
        signature,
        publicKey,
    };
}

async function uploadFile({
    file,
    fileName,
    folder,
    tags = [],
}) {
    if (!file) {
        throw new Error('File is required.');
    }

    if (!fileName) {
        throw new Error('File name is required.');
    }

    if (!folder) {
        throw new Error('Upload folder is required.');
    }

    const base64File = Buffer.isBuffer(file)
        ? file.toString('base64')
        : file;

    const response = await imagekit.files.upload({
        file: base64File,
        fileName,
        folder,
        tags,
        useUniqueFileName: true,
    });

    return {
        fileId: response.fileId,
        name: response.name,
        url: response.url,
        thumbnailUrl: response.thumbnailUrl || null,
        filePath: response.filePath,
        mimeType: response.mimeType || null,
        size: response.size || 0,
        width: response.width || null,
        height: response.height || null,
    };
}

module.exports = {
    getUploadAuthentication,
    uploadFile,
};