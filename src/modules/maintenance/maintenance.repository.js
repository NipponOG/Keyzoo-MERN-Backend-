'use strict';

const { getDatabase } = require('../../config/database');

const COLLECTION = 'settings';
const MAINTENANCE_ID = 'store-maintenance';

function getCollection() {
    return getDatabase().collection(COLLECTION);
}

async function getMaintenance() {
    return getCollection().findOne({
        _id: MAINTENANCE_ID,
    });
}

async function updateMaintenance(data) {
    const now = new Date();

    await getCollection().updateOne(
        {
            _id: MAINTENANCE_ID,
        },
        {
            $set: {
                enabled: Boolean(data.enabled),
                message:
                    data.message ||
                    "We're performing scheduled maintenance.",
                updatedAt: now,
                updatedBy: data.updatedBy || null,
            },

            $setOnInsert: {
                createdAt: now,
            },
        },
        {
            upsert: true,
        }
    );

    return getMaintenance();
}

module.exports = {
    getMaintenance,
    updateMaintenance,
};