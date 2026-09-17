'use strict';

const service = require('./hero-banner.service');


// Public
async function getPublishedHeroBanners(
    req,
    res,
    next
) {
    try {
        const banners =
            await service.getPublishedHeroBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}


// Admin
async function getAllHeroBanners(
    req,
    res,
    next
) {
    try {
        const banners =
            await service.getAllHeroBanners();

        return res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        next(error);
    }
}


// Admin
async function getHeroBannerById(
    req,
    res,
    next
) {
    try {
        const banner =
            await service.getHeroBannerById(
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


// Admin
async function createHeroBanner(
    req,
    res,
    next
) {
    try {
        const banner =
            await service.createHeroBanner(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Hero banner created successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}


// Admin
async function updateHeroBanner(
    req,
    res,
    next
) {
    try {
        const banner =
            await service.updateHeroBanner(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: 'Hero banner updated successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}


// Admin
async function deleteHeroBanner(
    req,
    res,
    next
) {
    try {
        const banner =
            await service.deleteHeroBanner(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            message: 'Hero banner deleted successfully.',
            data: banner,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPublishedHeroBanners,
    getAllHeroBanners,
    getHeroBannerById,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
};