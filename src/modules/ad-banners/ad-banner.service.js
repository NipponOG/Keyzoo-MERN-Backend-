'use strict';

const { ObjectId } = require('mongodb');
const repository = require('./ad-banner.repository');

function normalizeProductId(productId) {
    if (!productId) {
        return null;
    }

    if (!ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID.');
    }

    return new ObjectId(productId);
}

async function getAdBanners() {
    return repository.findAll();
}

async function getPublishedAdBanners() {
    return repository.findPublished();
}

async function getAdBannerById(id) {
    const adBanner = await repository.findById(id);

    if (!adBanner) {
        throw new Error('Ad banner not found.');
    }

    return adBanner;
}

async function createAdBanner(data = {}) {
    const payload = {
        ...data,
        productId: normalizeProductId(data.productId),
    };

    return repository.create(payload);
}

async function updateAdBanner(id, data = {}) {
    const existing = await repository.findById(id);

    if (!existing) {
        throw new Error('Ad banner not found.');
    }

    const allowedFields = [
        'title',
        'description',
        'image',
        'thumbnail',
        'trailer',
        'logo',
        'productId',
        'youtubeVideoId',
        'status',
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updateData[field] =
                field === 'productId'
                    ? normalizeProductId(data[field])
                    : data[field];
        }
    }

    return repository.updateById(id, updateData);
}

async function deleteAdBanner(id) {
    const existing = await repository.findById(id);

    if (!existing) {
        throw new Error('Ad banner not found.');
    }

    return repository.deleteById(id);
}

module.exports = {
    getAdBanners,
    getPublishedAdBanners,
    getAdBannerById,
    createAdBanner,
    updateAdBanner,
    deleteAdBanner,
};