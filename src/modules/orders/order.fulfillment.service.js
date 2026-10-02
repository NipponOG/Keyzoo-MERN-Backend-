'use strict';

const {
    startSession,
} = require('../../config/database');

const orderRepository =
    require('./order.repository');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildOrderDeliveryEmail,
} = require('../../services/email.templates');

const gameKeyRepository =
    require('../game-keys/game-key.repository');

async function assignKeyForItem(
    item,
    session
) {
    if (!item?.id) {
        const error = new Error(
            'Order item is missing its SKU ID.'
        );

        error.statusCode = 500;
        throw error;
    }

    if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    ) {
        const error = new Error(
            'Order item has an invalid quantity.'
        );

        error.statusCode = 500;
        throw error;
    }

    const assignedKeys = [];

    for (
        let index = 0;
        index < item.quantity;
        index += 1
    ) {
        let assignedKey;

        if (item.type === 'product') {
            assignedKey =
                await gameKeyRepository
                    .assignAvailableProductKey(
                        item.id,
                        session
                    );
        } else if (
            item.type === 'gift-card'
        ) {
            assignedKey =
                await gameKeyRepository
                    .assignAvailableGiftCardKey(
                        item.id,
                        session
                    );
        } else {
            const error = new Error(
                `Unsupported order item type: ${item.type}`
            );

            error.statusCode = 500;
            throw error;
        }

        if (!assignedKey) {
            const error = new Error(
                `No available key found for "${item.title}".`
            );

            error.statusCode = 409;
            throw error;
        }

        assignedKeys.push({
            keyId: assignedKey._id,
            code: assignedKey.code,

            itemId: item.id,
            itemType: item.type,

            title: item.title,

            quantityIndex: index + 1,
        });
    }

    return assignedKeys;
}

async function fulfillPaidOrder(
    orderNumber
) {
    if (!orderNumber) {
        const error = new Error(
            'Order number is required for fulfillment.'
        );

        error.statusCode = 400;
        throw error;
    }

    /*
     * Atomically claim the order.
     *
     * This prevents multiple Stripe webhook deliveries
     * from simultaneously attempting fulfillment.
     */
    const order =
        await orderRepository
            .claimOrderForFulfillment(
                orderNumber
            );

    if (!order) {
        const existingOrder =
            await orderRepository
                .findByOrderNumber(
                    orderNumber
                );

        if (!existingOrder) {
            const error = new Error(
                'Order not found.'
            );

            error.statusCode = 404;
            throw error;
        }

        return {
            alreadyProcessing: true,

            alreadyFulfilled:
                existingOrder
                    .gameKeysAssigned === true ||
                existingOrder.deliveryStatus ===
                'delivered',

            order: existingOrder,

            assignedKeys:
                existingOrder.assignedKeys ||
                [],
        };
    }

    const session = startSession();

    try {
        const assignedKeys = [];

        await session.withTransaction(
            async () => {
                /*
                 * Assign every required key inside
                 * the same MongoDB transaction.
                 */
                for (
                    const item of
                    order.cartSnapshot
                ) {
                    const itemKeys =
                        await assignKeyForItem(
                            item,
                            session
                        );

                    assignedKeys.push(
                        ...itemKeys
                    );
                }

                /*
                 * Save the completed fulfillment
                 * state inside the same transaction.
                 */
                const updatedOrder =
                    await orderRepository
                        .updateFulfillmentState(
                            orderNumber,
                            {
                                assignedKeys,

                                totalKeysAssigned:
                                    assignedKeys.length,

                                gameKeysAssigned:
                                    true,

                                deliveryStatus:
                                    'ready',

                                manualDeliveryRequired:
                                    false,

                                notes: null,
                            },
                            session
                        );

                if (!updatedOrder) {
                    const error = new Error(
                        'Failed to save assigned keys to the order.'
                    );

                    error.statusCode = 500;
                    throw error;
                }
            }
        );

        /*
 * Send the transactional delivery email only after
 * the fulfillment transaction has committed successfully.
 *
 * Email failure must NOT roll back fulfillment because
 * the keys have already been securely assigned.
 */
        try {
            const emailItems =
                order.cartSnapshot.map((item) => {
                    const itemKeys =
                        assignedKeys
                            .filter(
                                (assignedKey) =>
                                    String(
                                        assignedKey.itemId
                                    ) ===
                                    String(item.id) &&
                                    assignedKey.itemType ===
                                    item.type
                            )
                            .map(
                                (assignedKey) =>
                                    assignedKey.code
                            );

                    return {
                        ...item,
                        keys: itemKeys,
                    };
                });

            const frontendUrl =
                process.env.FRONTEND_URL ||
                'http://localhost:3000';

            const html =
                buildOrderDeliveryEmail({
                    orderNumber:
                        order.orderNumber,

                    deliveryEmail:
                        order.deliveryEmail,

                    items: emailItems,

                    subtotalAmount:
                        order.subtotalAmount,

                    discountAmount:
                        order.discountAmount || 0,

                    totalAmount:
                        order.totalAmount,

                    feeAmount:
                        order.feeAmount || 0,

                    currency:
                        order.currency || 'INR',

                    paymentMethod:
                        order.paymentMethod,

                    orderDate:
                        order.createdAt,

                    frontendUrl,

                    orderId:
                        order._id?.toString(),
                });

            await sendEmail({
                to: order.deliveryEmail,

                subject:
                    `Your Keyzoo Order ${order.orderNumber} Is Ready 🎮`,

                html,
            });

            console.log(
                '📧 Order delivery email sent successfully:',
                {
                    orderNumber,
                    deliveryEmail:
                        order.deliveryEmail,
                }
            );
        } catch (emailError) {
            /*
             * The order is already fulfilled.
             * Never convert a successful fulfillment into
             * manual delivery just because email failed.
             */
            console.error(
                '⚠️ Order was fulfilled, but delivery email could not be sent:',
                {
                    orderNumber,
                    error:
                        emailError.message,
                }
            );
        }

        console.log(
            '✅ Order keys assigned successfully:',
            {
                orderNumber,

                totalKeysAssigned:
                    assignedKeys.length,
            }
        );

        let updatedOrder;

        try {
            updatedOrder =
                await orderRepository
                    .findByOrderNumber(
                        orderNumber
                    );
        } catch (readError) {
            /*
             * The fulfillment transaction has already committed.
             *
             * Do not enter the failure/manual-delivery path here,
             * because the keys have already been assigned and the
             * order state has already been saved successfully.
             */
            console.error(
                '⚠️ Order was fulfilled, but the final order read failed:',
                {
                    orderNumber,
                    error: readError.message,
                }
            );

            return {
                alreadyProcessing: false,
                alreadyFulfilled: false,

                order: null,

                assignedKeys,
            };
        }

        return {
            alreadyProcessing: false,
            alreadyFulfilled: false,

            order: updatedOrder,

            assignedKeys,
        };
    } catch (error) {
        /*
         * Because the key assignments and order update
         * are inside the transaction, MongoDB rolls them
         * back automatically if the transaction fails.
         *
         * Only the manual-delivery state is written after
         * the transaction has failed.
         */
        try {
            const manualOrder =
                await orderRepository
                    .updateFulfillmentState(
                        orderNumber,
                        {
                            assignedKeys: [],
                            totalKeysAssigned: 0,

                            gameKeysAssigned: false,

                            deliveryStatus:
                                'manual',

                            manualDeliveryRequired:
                                true,

                            notes:
                                `Automatic fulfillment failed: ${error.message}`,
                        }
                    );

            if (!manualOrder) {
                console.error(
                    '❌ Failed to record manual fulfillment state: order could not be updated.',
                    {
                        orderNumber,
                    }
                );
            }
        } catch (
        stateUpdateError
        ) {
            console.error(
                '❌ Failed to save manual fulfillment state:',
                {
                    orderNumber,
                    error:
                        stateUpdateError.message,
                }
            );
        }

        console.error(
            '❌ Automatic order fulfillment failed:',
            {
                orderNumber,
                error: error.message,
            }
        );

        throw error;
    } finally {
        await session.endSession();
    }
}

module.exports = {
    fulfillPaidOrder,
};