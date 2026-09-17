'use strict';

const repository = require('./hero-banner.repository');

async function getAllHeroBanners() {
    return repository.findAll();
}

async function getPublishedHeroBanners() {
    return repository.findPublished();
}

async function getHeroBannerById(id) {
    const banner = await repository.findById(id);

    if (!banner) {
        const error = new Error(
            'Hero banner not found.'
        );

        error.status = 404;

        throw error;
    }

    return banner;
}

async function createHeroBanner(data) {
    if (!data.title?.trim()) {
        const error = new Error(
            'Banner title is required.'
        );

        error.status = 400;

        throw error;
    }

    if (!data.image) {
        const error = new Error(
            'Banner image is required.'
        );

        error.status = 400;

        throw error;
    }

    return repository.create({
        title: data.title.trim(),
        image: data.image,
        link: data.link || null,
        status: data.status || 'draft',
        sortOrder: Number(data.sortOrder) || 0,
    });
}

async function updateHeroBanner(id, data) {
    const existing = await repository.findById(id);

    if (!existing) {
        const error = new Error(
            'Hero banner not found.'
        );

        error.status = 404;

        throw error;
    }

    const allowedFields = [
        'title',
        'image',
        'link',
        'status',
        'sortOrder',
    ];

    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    if (
        updateData.title !== undefined &&
        !String(updateData.title).trim()
    ) {
        const error = new Error(
            'Banner title cannot be empty.'
        );

        error.status = 400;

        throw error;
    }

    if (updateData.title !== undefined) {
        updateData.title =
            String(updateData.title).trim();
    }

    if (updateData.sortOrder !== undefined) {
        updateData.sortOrder =
            Number(updateData.sortOrder) || 0;
    }

    return repository.updateById(
        id,
        updateData
    );
}

async function deleteHeroBanner(id) {
    const banner = await repository.findById(id);

    if (!banner) {
        const error = new Error(
            'Hero banner not found.'
        );

        error.status = 404;

        throw error;
    }

    return repository.deleteById(id);
}

module.exports = {
    getAllHeroBanners,
    getPublishedHeroBanners,
    getHeroBannerById,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
};