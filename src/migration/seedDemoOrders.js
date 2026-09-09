'use strict';

const { ObjectId } = require('mongodb');

const { connectDatabase, closeDatabase } = require('../config/database');
const { createOrderDocument } = require('../modules/orders/order.schema');

const COLLECTION = 'orders';

function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

function monthsAgo(months, day = 10) {
    const date = new Date();

    date.setMonth(date.getMonth() - months);
    date.setDate(day);
    date.setHours(12, 0, 0, 0);

    return date;
}

function cartItem({
    id,
    type,
    title,
    quantity,
    price,
    region = 'Global',
    itemType = type === 'gift-card' ? 'GIFT CARD' : 'GAME',
}) {
    return {
        id,
        type,
        title,
        quantity,
        price,
        region,
        item_type: itemType,
        item_type_game: type === 'product' ? itemType : undefined,
        item_type_gift: type === 'gift-card' ? itemType : undefined,
        image: null,
    };
}

function createDemoOrder(data) {
    const createdAt = data.createdAt || new Date();

    return createOrderDocument({
        orderNumber: data.orderNumber,

        cashfreeOrderId: data.cashfreeOrderId ?? null,

        totalAmount: data.totalAmount,
        currency: 'INR',

        paymentMethod: data.paymentMethod ?? 'upi',
        paymentProvider: data.paymentProvider ?? 'cashfree',

        paymentStatus: data.paymentStatus ?? 'paid',

        stripeSessionId: data.stripeSessionId ?? null,
        stripePaymentIntentId: data.stripePaymentIntentId ?? null,

        razorpayOrderId: data.razorpayOrderId ?? null,
        razorpayPaymentId: data.razorpayPaymentId ?? null,

        deliveryEmail: data.deliveryEmail || 'demo@keyzoo.test',

        status: data.status ?? 'processing',
        deliveryStatus: data.deliveryStatus ?? 'completed',

        gameKeysAssigned: data.gameKeysAssigned ?? true,
        deliveredAt: data.deliveredAt ?? createdAt,

        notes: 'DEMO ORDER - DEVELOPMENT ONLY',

        cartSnapshot: data.cartSnapshot || [],

        userId: data.userId ?? new ObjectId().toString(),

        assignedKeys: data.assignedKeys || [],

        manualDeliveryRequired:
            data.manualDeliveryRequired ?? false,

        totalKeysRequired:
            data.totalKeysRequired ??
            (data.cartSnapshot || []).reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
            ),

        totalKeysAssigned:
            data.totalKeysAssigned ??
            (data.assignedKeys || []).length,

        cashfreePaymentId: data.cashfreePaymentId ?? null,

        paymentDetails: data.paymentDetails ?? null,

        createdAt,
        updatedAt: createdAt,
    });
}

async function seedDemoOrders() {
    const db = await connectDatabase();
    const collection = db.collection(COLLECTION);

    // Remove only our demo orders.
    await collection.deleteMany({
        notes: 'DEMO ORDER - DEVELOPMENT ONLY',
    });

    const game = cartItem({
        id: 1,
        type: 'product',
        title: 'Demo Game',
        quantity: 1,
        price: 1499,
    });

    const game2 = cartItem({
        id: 2,
        type: 'product',
        title: 'Demo Premium Game',
        quantity: 2,
        price: 2499,
    });

    const giftCard = cartItem({
        id: 1,
        type: 'gift-card',
        title: 'Demo Gift Card',
        quantity: 1,
        price: 1000,
    });

    const giftCard2 = cartItem({
        id: 2,
        type: 'gift-card',
        title: 'Demo Gaming Gift Card',
        quantity: 2,
        price: 500,
    });

    const orders = [
        // -----------------------------------------
        // Current month
        // -----------------------------------------

        createDemoOrder({
            orderNumber: 'DEMO-001',
            totalAmount: 1499,
            paymentProvider: 'cashfree',
            paymentMethod: 'upi',
            cartSnapshot: [game],
            assignedKeys: [
                {
                    productId: 1,
                    product: 'Demo Game',
                    type: 'product',
                    key: 'DEMO-KEY-001',
                },
            ],
            createdAt: daysAgo(0),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-002',
            totalAmount: 4998,
            paymentProvider: 'razorpay',
            paymentMethod: 'upi',
            razorpayOrderId: 'demo_rzp_order_002',
            razorpayPaymentId: 'demo_rzp_payment_002',
            cartSnapshot: [game2],
            assignedKeys: [
                {
                    productId: 2,
                    product: 'Demo Premium Game',
                    type: 'product',
                    key: 'DEMO-KEY-002',
                },
                {
                    productId: 2,
                    product: 'Demo Premium Game',
                    type: 'product',
                    key: 'DEMO-KEY-003',
                },
            ],
            createdAt: daysAgo(1),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-003',
            totalAmount: 1000,
            paymentProvider: 'stripe',
            paymentMethod: 'card',
            stripeSessionId: 'demo_stripe_session_003',
            stripePaymentIntentId: 'demo_stripe_payment_003',
            cartSnapshot: [giftCard],
            assignedKeys: [
                {
                    productId: 1,
                    product: 'Demo Gift Card',
                    type: 'gift-card',
                    key: 'DEMO-GIFT-001',
                },
            ],
            createdAt: daysAgo(2),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-004',
            totalAmount: 1000,
            paymentProvider: 'cashfree',
            paymentMethod: 'upi',
            cartSnapshot: [giftCard2],
            assignedKeys: [
                {
                    productId: 2,
                    product: 'Demo Gaming Gift Card',
                    type: 'gift-card',
                    key: 'DEMO-GIFT-002',
                },
            ],
            createdAt: daysAgo(3),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-005',
            totalAmount: 2499,
            paymentProvider: 'razorpay',
            paymentMethod: 'upi',
            cartSnapshot: [game],
            assignedKeys: [],
            deliveryStatus: 'partial',
            gameKeysAssigned: true,
            manualDeliveryRequired: true,
            totalKeysRequired: 1,
            totalKeysAssigned: 0,
            deliveredAt: null,
            createdAt: daysAgo(4),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-006',
            totalAmount: 1999,
            paymentProvider: 'cashfree',
            paymentMethod: 'upi',
            paymentStatus: 'pending',
            deliveryStatus: 'pending',
            gameKeysAssigned: false,
            manualDeliveryRequired: false,
            assignedKeys: [],
            createdAt: daysAgo(5),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-007',
            totalAmount: 2999,
            paymentProvider: 'stripe',
            paymentMethod: 'card',
            paymentStatus: 'refunded',
            deliveryStatus: 'pending',
            gameKeysAssigned: false,
            assignedKeys: [],
            createdAt: daysAgo(6),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-008',
            totalAmount: 2998,
            paymentProvider: 'cashfree',
            paymentMethod: 'upi',
            cartSnapshot: [game, giftCard],
            assignedKeys: [
                {
                    productId: 1,
                    product: 'Demo Game',
                    type: 'product',
                    key: 'DEMO-KEY-004',
                },
                {
                    productId: 1,
                    product: 'Demo Gift Card',
                    type: 'gift-card',
                    key: 'DEMO-GIFT-003',
                },
            ],
            createdAt: daysAgo(8),
        }),

        // -----------------------------------------
        // Previous months
        // -----------------------------------------

        createDemoOrder({
            orderNumber: 'DEMO-009',
            totalAmount: 3999,
            paymentProvider: 'stripe',
            paymentMethod: 'card',
            cartSnapshot: [game2],
            createdAt: monthsAgo(1, 12),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-010',
            totalAmount: 2000,
            paymentProvider: 'cashfree',
            paymentMethod: 'upi',
            cartSnapshot: [giftCard2],
            createdAt: monthsAgo(2, 15),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-011',
            totalAmount: 5999,
            paymentProvider: 'razorpay',
            paymentMethod: 'upi',
            cartSnapshot: [game, giftCard2],
            createdAt: monthsAgo(3, 18),
        }),

        createDemoOrder({
            orderNumber: 'DEMO-012',
            totalAmount: 1299,
            paymentProvider: 'stripe',
            paymentMethod: 'card',
            paymentStatus: 'refunded',
            deliveryStatus: 'pending',
            gameKeysAssigned: false,
            assignedKeys: [],
            createdAt: monthsAgo(4, 20),
        }),
    ];

    const result = await collection.insertMany(orders);

    console.log('');
    console.log('======================================');
    console.log('✅ DEMO ORDERS SEEDED');
    console.log('======================================');
    console.log(`Inserted: ${result.insertedCount}`);
    console.log('');
    console.log('Demo order numbers:');

    orders.forEach((order) => {
        console.log(`- ${order.orderNumber}`);
    });

    console.log('');
}

seedDemoOrders()
    .catch((error) => {
        console.error('❌ Failed to seed demo orders:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await closeDatabase();
    });