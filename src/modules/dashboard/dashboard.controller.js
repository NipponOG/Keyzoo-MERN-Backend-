'use strict';

const dashboardService = require('./dashboard.service');

async function getRevenueChart(req, res, next) {
    try {
        const data = await dashboardService.getRevenueChart();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getCategorySales(req, res, next) {
    try {
        const data = await dashboardService.getCategorySales();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getOrderChart(req, res, next) {
    try {
        const data = await dashboardService.getOrderChart();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

async function getRefundsChart(req, res, next) {
    try {
        const data = await dashboardService.getRefundsChart();

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRevenueChart,
    getCategorySales,
    getOrderChart,
    getRefundsChart,
};