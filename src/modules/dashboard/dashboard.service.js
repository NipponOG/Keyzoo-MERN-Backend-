'use strict';

const dashboardRepository = require('./dashboard.repository');

const MONTH_NAMES = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

function formatMonth(row) {
    return MONTH_NAMES[(row._id.month || 1) - 1];
}

async function getRevenueChart() {
    const rows = await dashboardRepository.getRevenueChart();

    return rows.map((row) => ({
        month: formatMonth(row),
        revenue: row.revenue || 0,
    }));
}

async function getOrderChart() {
    const rows = await dashboardRepository.getOrderChart();

    return rows.map((row) => ({
        month: formatMonth(row),
        orders: row.orders || 0,
    }));
}

async function getRefundsChart() {
    const rows = await dashboardRepository.getRefundsChart();

    return rows.map((row) => ({
        month: formatMonth(row),
        refunds: row.refunds || 0,
    }));
}

async function getCategorySales() {
    const rows = await dashboardRepository.getCategorySales();

    const categories = rows.map((row) => {
        let name = row._id;

        if (name === 'product') {
            name = 'Games';
        } else if (name === 'gift-card') {
            name = 'Gift Cards';
        } else if (!name) {
            name = 'Other';
        }

        return {
            name,
            value: row.value || 0,
        };
    });

    const total = categories.reduce(
        (sum, category) => sum + category.value,
        0
    );

    if (total === 0) {
        return [];
    }

    return categories.map((category) => ({
        name: category.name,
        value: Math.round((category.value / total) * 100),
    }));
}

module.exports = {
    getRevenueChart,
    getOrderChart,
    getRefundsChart,
    getCategorySales,
};