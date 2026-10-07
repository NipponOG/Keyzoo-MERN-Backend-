'use strict';

const orderService = require('../orders/order.service');
const invoiceService = require('./invoice.service');
const invoicePdfService = require('./invoice.pdf.service');

async function downloadInvoice(req, res, next) {
    try {
        const { orderNumber } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            const error = new Error(
                'Authenticated user is required.'
            );

            error.statusCode = 401;

            throw error;
        }

        if (!orderNumber) {
            const error = new Error(
                'Order number is required.'
            );

            error.statusCode = 400;

            throw error;
        }

        const order =
            await orderService.getUserOrderByOrderNumber(
                userId,
                orderNumber
            );

        if (
            order.paymentStatus !== 'paid'
        ) {
            const error = new Error(
                'Invoice is available only after payment is confirmed.'
            );

            error.statusCode = 409;

            throw error;
        }

        const invoice =
            invoiceService.buildInvoiceData(
                order
            );

        const pdfBuffer =
            await invoicePdfService.generateInvoicePdf(
                invoice
            );

        const fileName =
            `${invoice.invoiceNumber}.pdf`;

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        res.setHeader(
            'Content-Length',
            pdfBuffer.length
        );

        res.setHeader(
            'Cache-Control',
            'private, no-store, max-age=0'
        );

        return res.status(200).send(
            pdfBuffer
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    downloadInvoice,
};