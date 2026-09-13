'use strict';

const {
    createUploadSignature,
} = require('./cloudinary');

function getUploadSignature(options = {}) {
    return createUploadSignature(
        options
    );
}

module.exports = {
    getUploadSignature,
};