'use strict';

const service = require('./search.service');

async function liveSearch(req, res, next) {
    try {
        const query = req.query.q || '';

        const results = await service.search(query);

        return res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    liveSearch,
};