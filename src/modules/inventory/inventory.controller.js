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

module.exports = {
    getInventory,
};