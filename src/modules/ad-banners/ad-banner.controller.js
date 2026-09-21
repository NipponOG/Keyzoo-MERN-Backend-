'use strict';

const service = require('./ad-banner.service');

async function getAdBanners(req, res, next) {
    try {
        const banners = await service.getAdBanners();

        return res.json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getPublishedAdBanners(req, res, next) {
    try {
        const banners =
            await service.getPublishedAdBanners();

        return res.json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getAdBannerById(req, res, next) {
    try {
        const banner =
            await service.getAdBannerById(req.params.id);

        return res.json({
            success: true,
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function createAdBanner(req, res, next) {
    try {
        const banner =
            await service.createAdBanner(req.body);

        return res.status(201).json({
            success: true,
            message: 'Ad banner created successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function updateAdBanner(req, res, next) {
    try {
        const banner =
            await service.updateAdBanner(
                req.params.id,
                req.body
            );

        return res.json({
            success: true,
            message: 'Ad banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteAdBanner(req, res, next) {
    try {
        await service.deleteAdBanner(req.params.id);

        return res.json({
            success: true,
            message: 'Ad banner deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAdBanners,
    getPublishedAdBanners,
    getAdBannerById,
    createAdBanner,
    updateAdBanner,
    deleteAdBanner,
};