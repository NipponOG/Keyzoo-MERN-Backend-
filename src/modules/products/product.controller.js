'use strict';

const productService = require('./product.service');

async function getProductBySlug(req, res, next) {
    try {
        const product = await productService.getProductBySlug(
            req.params.slug
        );

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProductBySlug,
};