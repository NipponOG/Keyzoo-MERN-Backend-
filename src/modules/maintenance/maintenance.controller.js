'use strict';

const maintenanceService =
    require('./maintenance.service');

async function getStatus(req, res, next) {
    try {
        const maintenance =
            await maintenanceService.getMaintenanceStatus();

        return res.status(200).json({
            success: true,
            data: maintenance,
        });
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const adminId =
            req.user?._id ||
            req.user?.id ||
            null;

        const maintenance =
            await maintenanceService.updateMaintenance(
                req.body,
                adminId
            );

        return res.status(200).json({
            success: true,
            message: maintenance.enabled
                ? 'Maintenance mode enabled.'
                : 'Maintenance mode disabled.',
            data: maintenance,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getStatus,
    updateStatus,
};