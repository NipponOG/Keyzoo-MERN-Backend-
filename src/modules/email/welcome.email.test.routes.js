'use strict';

const express = require('express');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildWelcomeEmail,
} = require('../../services/auth.email.templates');

const router = express.Router();

router.post('/welcome-test', async (req, res, next) => {
    try {
        const {
            to,
            name = 'Nippan',
        } = req.body;

        if (!to) {
            const error = new Error(
                'Recipient email is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        const html = buildWelcomeEmail({
            name,
            email: to,
            frontendUrl: 'https://keyzoo.shop',
        });

        const result = await sendEmail({
            to,
            subject: 'Welcome to Keyzoo 🎮',
            html,
        });

        res.status(200).json({
            success: true,
            message: 'Welcome email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;