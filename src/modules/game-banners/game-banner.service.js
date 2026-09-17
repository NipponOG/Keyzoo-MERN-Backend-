'use strict';

const repository = require('./game-banner.repository');
const { createGameBannerDocument } = require('./game-banner.schema');

async function getAllGameBanners() {
    return repository.findAll();
}

async function getPublishedGameBanners() {
    return repository.findPublished();
}

async function getGameBannerById(id) {
    return repository.findById(id);
}

async function createGameBanner(data) {
    if (!data.title || !data.title.trim()) {
        throw new Error('Game banner title is required.');
    }

    if (!data.image || !data.image.trim()) {
        throw new Error('Game banner image is required.');
    }

    const document = createGameBannerDocument({
        title: data.title.trim(),
        image: data.image.trim(),
        link: data.link?.trim() || null,
        status: data.status || 'draft',
        sortOrder: Number(data.sortOrder) || 0,
    });

    return repository.create(document);
}

async function updateGameBanner(id, data) {
    const existing = await repository.findById(id);

    if (!existing) {
        throw new Error('Game banner not found.');
    }

    const updates = {};

    if (data.title !== undefined) {
        if (!data.title.trim()) {
            throw new Error('Game banner title is required.');
        }

        updates.title = data.title.trim();
    }

    if (data.image !== undefined) {
        if (!data.image.trim()) {
            throw new Error('Game banner image is required.');
        }

        updates.image = data.image.trim();
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

async function deleteGameBanner(id) {
    const existing = await repository.findById(id);

    if (!existing) {
        throw new Error('Game banner not found.');
    }

    await repository.deleteById(id);

    return {
        success: true,
    };
}

module.exports = {
    getAllGameBanners,
    getPublishedGameBanners,
    getGameBannerById,
    createGameBanner,
    updateGameBanner,
    deleteGameBanner,
};