'use strict';

const express = require('express');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildOrderDeliveryEmail,
} = require('../../services/email.templates');

const router = express.Router();

router.post('/test', async (req, res, next) => {
    try {
        const { to } = req.body;

        if (!to) {
            const error = new Error(
                'Recipient email is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        const html = buildOrderDeliveryEmail({
            orderNumber: 'KZ-TEST-EMAIL-001',
            deliveryEmail: to,

            subtotalAmount: 999,
            feeAmount: 20,
            discountAmount: 100,
            totalAmount: 919,

            currency: 'INR',
            paymentMethod: 'Stripe',
            orderDate: new Date(),

            items: [
                {
                    title: 'Grand Theft Auto V',
                    platform: 'Rockstar Launcher',
                    quantity: 1,
                    image: 'https://driffle.com/_next/image?url=https%3A%2F%2Fstatic.driffle.com%2Ffit-in%2F720x512%2Fmedia-gallery%2Fproduction%2F29399902-1e18-4360-83c4-9ead9cfee2df_31.jpg&w=1200&q=75',
                    keys: [
                        'AAAAA-BBBBB-CCCCC-DDDDD',
                    ],
                },
                {
                    title: 'PlayStation Network Gift Card',
                    platform: 'PlayStation',
                    quantity: 2,
                    image: 'https://driffle.com/_next/image?url=https%3A%2F%2Fstatic.driffle.com%2Ffit-in%2F720x512%2Fmedia-gallery%2Fproduction%2F5bef578e-ab2e-48aa-96d1-fc0d38be6a7c_1000-inr-psnpng&w=1200&q=75',
                    keys: [
                        '11111-22222-33333',
                        '44444-55555-66666',
                    ],
                },
            ],
        });

        const result = await sendEmail({
            to,
            subject: 'Your Keyzoo Order Is Ready — KZ-TEST-EMAIL-001',
            html,
        });

        res.status(200).json({
            success: true,
            message: 'Test delivery email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;