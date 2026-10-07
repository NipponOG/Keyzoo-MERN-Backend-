'use strict';

/**
 * Builds invoice data from a customer-safe order object.
 *
 * The order service already provides the historical purchased
 * items through `items`, so the invoice uses that snapshot.
 */

function createInvoiceNumber(order) {
    const orderNumber =
        typeof order?.orderNumber === 'string'
            ? order.orderNumber.trim()
            : '';

    if (!orderNumber) {
        throw new Error(
            'Order number is required to create an invoice number.'
        );
    }

    return `KZ-INV-${orderNumber.replace(/^KZ-/i, '')}`;
}

function normalizeAmount(value) {
    const amount = Number(value);

    return Number.isFinite(amount)
        ? amount
        : 0;
}

function normalizeString(value) {
    if (
        typeof value !== 'string' ||
        !value.trim()
    ) {
        return null;
    }

    return value.trim();
}

function buildInvoiceItem(item) {
    return {
        id:
            item?.id?.toString?.() ??
            item?.id ??
            null,

        type:
            normalizeString(item?.type),

        title:
            normalizeString(item?.title) ??
            'Digital Product',

        slug:
            normalizeString(item?.slug),

        quantity:
            Number.isInteger(Number(item?.quantity)) &&
                Number(item.quantity) > 0
                ? Number(item.quantity)
                : 1,

        unitPrice:
            normalizeAmount(item?.unitPrice),

        subtotal:
            normalizeAmount(item?.subtotal),

        currency:
            normalizeString(item?.currency),

        region:
            normalizeString(item?.region),

        var_title:
            normalizeString(item?.var_title),
    };
}

function buildInvoiceData(order) {
    if (!order) {
        const error = new Error(
            'Order is required to create an invoice.'
        );

        error.statusCode = 400;

        throw error;
    }

    if (!order.orderNumber) {
        const error = new Error(
            'Order number is required to create an invoice.'
        );

        error.statusCode = 400;

        throw error;
    }

    const items = Array.isArray(order.items)
        ? order.items.map(buildInvoiceItem)
        : [];

    if (!items.length) {
        const error = new Error(
            'Order does not contain any invoice items.'
        );

        error.statusCode = 400;

        throw error;
    }

    return {
        invoiceNumber:
            createInvoiceNumber(order),

        invoiceDate:
            order.createdAt ??
            new Date(),

        orderNumber:
            order.orderNumber,

        customer: {
            email:
                normalizeString(
                    order.deliveryEmail
                ),
        },

        items,

        subtotalAmount:
            normalizeAmount(
                order.subtotalAmount ??
                order.totalAmount
            ),

        discountAmount:
            normalizeAmount(
                order.discountAmount
            ),

        totalAmount:
            normalizeAmount(
                order.totalAmount
            ),

        currency:
            normalizeString(order.currency) ??
            'INR',

        coupon:
            order.coupon
                ? {
                    code:
                        normalizeString(
                            order.coupon.code
                        ),

                    discountType:
                        normalizeString(
                            order.coupon.discountType
                        ),

                    discountValue:
                        normalizeAmount(
                            order.coupon.discountValue
                        ),

                    discount:
                        normalizeAmount(
                            order.coupon.discount
                        ),
                }
                : null,

        payment: {
            method:
                normalizeString(
                    order.paymentMethod
                ),

            provider:
                normalizeString(
                    order.paymentProvider
                ),

            status:
                normalizeString(
                    order.paymentStatus
                ),
        },
    };
}

module.exports = {
    buildInvoiceData,
};