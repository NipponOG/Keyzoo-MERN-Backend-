'use strict';

const repository = require('./category-banner.repository');
const {
    createCategoryBannerDocument,
} = require('./category-banner.schema');

async function getAllCategoryBanners() {
    return repository.findAll();
}

async function getPublishedCategoryBanners() {
    return repository.findPublished();
}

async function getCategoryBannerById(id) {
    const banner = await repository.findById(id);

    if (!banner) {
        const error = new Error('Category banner not found.');
        error.statusCode = 404;
        throw error;
    }

    return banner;
}

async function createCategoryBanner(data = {}) {
    const title = data.title?.trim();
    const desktopImage = data.desktopImage?.trim();
    const mobileImage = data.mobileImage?.trim();

    if (!title) {
        const error = new Error(
            'Category banner title is required.'
        );
        error.statusCode = 400;
        throw error;
    }

    if (!desktopImage) {
        const error = new Error(
            'Desktop image is required.'
        );
        error.statusCode = 400;
        throw error;
    }

    const document = createCategoryBannerDocument({
        title,
        desktopImage,
        mobileImage: mobileImage || null,
        link: data.link?.trim() || null,
        status: data.status || 'draft',
        sortOrder: Number(data.sortOrder) || 0,
    });

    return repository.create(document);
}

async function updateCategoryBanner(id, data = {}) {
    const existingBanner = await repository.findById(id);

    if (!existingBanner) {
        const error = new Error('Category banner not found.');
        error.statusCode = 404;
        throw error;
    }

    const updates = {};

    if (data.title !== undefined) {
        const title = data.title?.trim();

        if (!title) {
            const error = new Error(
                'Category banner title is required.'
            );
            error.statusCode = 400;
            throw error;
        }

        updates.title = title;
    }

    if (data.desktopImage !== undefined) {
        const desktopImage = data.desktopImage?.trim();

        if (!desktopImage) {
            const error = new Error(
                'Desktop image is required.'
            );
            error.statusCode = 400;
            throw error;
        }

        updates.desktopImage = desktopImage;
    }

    if (data.mobileImage !== undefined) {
        updates.mobileImage =
            data.mobileImage?.trim() || null;
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

async function deleteCategoryBanner(id) {
    const existingBanner = await repository.findById(id);

    if (!existingBanner) {
        const error = new Error('Category banner not found.');
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteById(id);
}

module.exports = {
    getAllCategoryBanners,
    getPublishedCategoryBanners,
    getCategoryBannerById,
    createCategoryBanner,
    updateCategoryBanner,
    deleteCategoryBanner,
};