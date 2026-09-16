'use strict';

const maintenanceService =
    require('../modules/maintenance/maintenance.service');

async function maintenanceMiddleware(req, res, next) {
    try {
        const maintenance =
            await maintenanceService.getMaintenanceStatus();

        if (!maintenance.enabled) {
            return next();
        }

        return res.status(503).json({
            success: false,
            maintenance: true,
            message:
                maintenance.message ||
                'Keyzoo is currently under maintenance.',
        });
    } catch (error) {
        // If maintenance status cannot be checked,
        // do not accidentally take the store offline.
        console.error(
            'Maintenance middleware error:',
            error
        );

        return next();
    }
}

module.exports = maintenanceMiddleware;