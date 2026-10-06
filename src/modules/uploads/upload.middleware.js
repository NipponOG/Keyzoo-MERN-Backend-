'use strict';

const multer = require('multer');

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        const error = new Error(
            'Unsupported file type. Only JPG, PNG, WEBP, and PDF files are allowed.'
        );

        error.statusCode = 400;

        return callback(error, false);
    }

    callback(null, true);
};

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5,
    },
    fileFilter,
});

module.exports = {
    upload,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
};