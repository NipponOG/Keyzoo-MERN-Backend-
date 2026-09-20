'use strict';

const inventoryService = require('./inventory.service');

async function getInventory(req, res, next) {
    try {
        const inventory = await inventoryService.getInventory();

        res.json({
            success: true,
            ...inventory,
        });
    } catch (error) {
        next(error);
    }
}

async function bulkDeleteItems(req, res, next) {
    try {
        const { items } = req.body;

        const result =
            await inventoryService.bulkDeleteItems(items);

        return res.json({
            success: true,
            message: 'Bulk delete completed.',
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInventory,
    bulkDeleteItems,
};