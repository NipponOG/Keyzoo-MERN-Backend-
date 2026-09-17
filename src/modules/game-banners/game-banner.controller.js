'use strict';

const service = require('./game-banner.service');

async function getPublishedGameBanners(req, res, next) {
    try {
        const banners = await service.getPublishedGameBanners();

        return res.json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getAllGameBanners(req, res, next) {
    try {
        const banners = await service.getAllGameBanners();

        return res.json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getGameBannerById(req, res, next) {
    try {
        const banner = await service.getGameBannerById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Game banner not found.',
            });
        }

        return res.json({
            success: true,
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function createGameBanner(req, res, next) {
    try {
        const banner = await service.createGameBanner(req.body);

        return res.status(201).json({
            success: true,
            message: 'Game banner created successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function updateGameBanner(req, res, next) {
    try {
        const banner = await service.updateGameBanner(
            req.params.id,
            req.body
        );

        return res.json({
            success: true,
            message: 'Game banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteGameBanner(req, res, next) {
    try {
        await service.deleteGameBanner(req.params.id);

        return res.json({
            success: true,
            message: 'Game banner deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublishedGameBanners,
    getAllGameBanners,
    getGameBannerById,
    createGameBanner,
    updateGameBanner,
    deleteGameBanner,
};