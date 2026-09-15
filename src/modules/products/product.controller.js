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

async function getProductById(req, res, next) {
    try {
        const product = await productService.getProductById(
            req.params.id
        );

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

async function getProductVariations(req, res, next) {
    try {
        const products =
            await productService.getProductVariations(
                req.params.productGroupId
            );

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
}

async function createProduct(req, res, next) {
    try {
        const product = await productService.createProduct(
            req.body
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        next(error);
    }
}

async function createProductWithVariations(req, res, next) {
    try {
        const result =
            await productService.createProductWithVariations(
                req.body
            );

        res.status(201).json({
            success: true,
            message: 'Product variations created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;

        const updatedProduct = await productService.updateProduct(
            id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            data: updatedProduct,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;

        const result = await productService.deleteProduct(id);

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProductBySlug,
    getProductById,
    getProductVariations,
    createProduct,
    createProductWithVariations,
    updateProduct,
    deleteProduct,
};