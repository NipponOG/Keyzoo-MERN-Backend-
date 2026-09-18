'use strict';

const categoryBannerService = require('./category-banner.service');

async function getPublishedCategoryBanners(req, res, next) {
    try {
        const banners =
            await categoryBannerService.getPublishedCategoryBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getAllCategoryBanners(req, res, next) {
    try {
        const banners =
            await categoryBannerService.getAllCategoryBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}

async function getCategoryBannerById(req, res, next) {
    try {
        const banner =
            await categoryBannerService.getCategoryBannerById(
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

async function createCategoryBanner(req, res, next) {
    try {
        const banner =
            await categoryBannerService.createCategoryBanner(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Category banner created successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function updateCategoryBanner(req, res, next) {
    try {
        const banner =
            await categoryBannerService.updateCategoryBanner(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: 'Category banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCategoryBanner(req, res, next) {
    try {
        await categoryBannerService.deleteCategoryBanner(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: 'Category banner deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublishedCategoryBanners,
    getAllCategoryBanners,
    getCategoryBannerById,
    createCategoryBanner,
    updateCategoryBanner,
    deleteCategoryBanner,
};