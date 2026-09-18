'use strict';

const repository = require('./promo-banner.repository');
const { createPromoBannerDocument } = require('./promo-banner.schema');

async function getAllPromoBanners() {
    return repository.findAll();
}

async function getPublishedPromoBanners() {
    return repository.findPublished();
}

async function getPromoBannerById(id) {
    const banner = await repository.findById(id);

    if (!banner) {
        const error = new Error('Promo banner not found.');
        error.statusCode = 404;
        throw error;
    }

    return banner;
}

async function createPromoBanner(data = {}) {
    const title = data.title?.trim();
    const image = data.image?.trim();

    if (!title) {
        const error = new Error('Promo banner title is required.');
        error.statusCode = 400;
        throw error;
    }

    if (!image) {
        const error = new Error('Promo banner image is required.');
        error.statusCode = 400;
        throw error;
    }

    const document = createPromoBannerDocument({
        title,
        image,
        link: data.link?.trim() || null,
        status: data.status || 'draft',
        sortOrder: Number(data.sortOrder) || 0,
    });

    return repository.create(document);
}

async function updatePromoBanner(id, data = {}) {
    const existingBanner = await repository.findById(id);

    if (!existingBanner) {
        const error = new Error('Promo banner not found.');
        error.statusCode = 404;
        throw error;
    }

    const updates = {};

    if (data.title !== undefined) {
        const title = data.title?.trim();

        if (!title) {
            const error = new Error('Promo banner title is required.');
            error.statusCode = 400;
            throw error;
        }

        updates.title = title;
    }

    if (data.image !== undefined) {
        const image = data.image?.trim();

        if (!image) {
            const error = new Error('Promo banner image is required.');
            error.statusCode = 400;
            throw error;
        }

        updates.image = image;
    }

    if (data.link !== undefined) {
        updates.link = data.link?.trim() || null;
    }

    if (data.status !== undefined) {
        updates.status = data.status;
    }

    if (data.sortOrder !== undefined) {
        updates.sortOrder = Number(data.sortOrder) || 0;
    }

    return repository.updateById(id, updates);
}

async function deletePromoBanner(id) {
    const existingBanner = await repository.findById(id);

    if (!existingBanner) {
        const error = new Error('Promo banner not found.');
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteById(id);
}

module.exports = {
    getAllPromoBanners,
    getPublishedPromoBanners,
    getPromoBannerById,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
};