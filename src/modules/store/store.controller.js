'use strict';

const storeService = require('./store.service');

async function getStoreItems(req, res, next) {

    try {

        const result = await storeService.getStoreItems(req.query);

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        return next(error);

    }
}

async function getStoreFilterOptions(req, res, next) {
    try {
        const result = await storeService.getStoreFilterOptions();

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getStoreItems,
    getStoreFilterOptions,
};