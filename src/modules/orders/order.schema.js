'use strict';

function createOrderDocument(data = {}) {
    const now = new Date();

    return {

        orderNumber: data.orderNumber ?? '',
        cashfreeOrderId: data.cashfreeOrderId ?? undefined,

        totalAmount: data.totalAmount ?? 0,
        currency: data.currency ?? 'INR',

        paymentMethod: data.paymentMethod ?? null,
        paymentProvider: data.paymentProvider ?? null,

        paymentStatus: data.paymentStatus ?? 'pending',

        stripeSessionId: data.stripeSessionId ?? undefined,
        stripePaymentIntentId: data.stripePaymentIntentId ?? undefined,

        razorpayOrderId: data.razorpayOrderId ?? undefined,
        razorpayPaymentId: data.razorpayPaymentId ?? undefined,

        deliveryEmail: data.deliveryEmail ?? '',

        status: data.status ?? 'processing',
        deliveryStatus: data.deliveryStatus ?? 'pending',

        gameKeysAssigned: data.gameKeysAssigned ?? false,
        deliveredAt: data.deliveredAt ?? null,

        notes: data.notes ?? null,

        cartSnapshot: data.cartSnapshot ?? [],

        // MongoDB user ObjectId
        userId: data.userId ?? null,

        assignedKeys: data.assignedKeys ?? [],

        manualDeliveryRequired:
            data.manualDeliveryRequired ?? false,

        totalKeysRequired:
            data.totalKeysRequired ?? 0,

        totalKeysAssigned:
            data.totalKeysAssigned ?? 0,

        cashfreePaymentId:
            data.cashfreePaymentId ?? null,

        paymentDetails:
            data.paymentDetails ?? null,

        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createOrderDocument,
};

