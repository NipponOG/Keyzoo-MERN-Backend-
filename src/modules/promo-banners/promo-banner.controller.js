'use strict';

const promoBannerService = require('./promo-banner.service');

async function getPublishedPromoBanners(req, res, next) {
    try {
        const banners =
            await promoBannerService.getPublishedPromoBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getAllPromoBanners(req, res, next) {
    try {
        const banners =
            await promoBannerService.getAllPromoBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getPromoBannerById(req, res, next) {
    try {
        const banner =
            await promoBannerService.getPromoBannerById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function createPromoBanner(req, res, next) {
    try {
        const banner =
            await promoBannerService.createPromoBanner(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Promo banner created successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function updatePromoBanner(req, res, next) {
    try {
        const banner =
            await promoBannerService.updatePromoBanner(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: 'Promo banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function deletePromoBanner(req, res, next) {
    try {
        await promoBannerService.deletePromoBanner(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: 'Promo banner deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublishedPromoBanners,
    getAllPromoBanners,
    getPromoBannerById,
    createPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
};