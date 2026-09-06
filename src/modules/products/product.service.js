'use strict';

const repository = require('./product.repository');

async function getProductBySlug(slug) {
    if (!slug) {
        const error = new Error('Product slug is required');
        error.statusCode = 400;
        throw error;
    }

    const product = await repository.findBySlug(slug);

    if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    return product;
}

module.exports = {
    getProductBySlug,
};