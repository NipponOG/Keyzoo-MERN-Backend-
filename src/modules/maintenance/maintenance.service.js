'use strict';

const repository = require('./maintenance.repository');

const DEFAULT_MAINTENANCE = {
    enabled: false,
    message:
        "We're performing scheduled maintenance.",
};

async function getMaintenanceStatus() {
    const maintenance =
        await repository.getMaintenance();

    if (!maintenance) {
        return DEFAULT_MAINTENANCE;
    }

    return {
        enabled: maintenance.enabled === true,
        message:
            maintenance.message ||
            DEFAULT_MAINTENANCE.message,
        updatedAt:
            maintenance.updatedAt || null,
    };
}

async function updateMaintenance(data, adminId = null) {
    if (typeof data.enabled !== 'boolean') {
        const error = new Error(
            'enabled must be a boolean.'
        );

        error.status = 400;
        throw error;
    }

    return repository.updateMaintenance({
        enabled: data.enabled,
        message: data.message,
        updatedBy: adminId,
    });
}

module.exports = {
    getMaintenanceStatus,
    updateMaintenance,
};