'use strict';

const express = require('express');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildPasswordResetEmail,
} = require('../../services/auth.email.templates');

const router = express.Router();

router.post('/password-reset-test', async (req, res, next) => {
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

        const resetUrl =
            'https://keyzoo.shop/reset-password?token=test-reset-token';

        const html = buildPasswordResetEmail({
            name,
            email: to,
            resetUrl,
            expiresIn: '30 minutes',
        });

        const result = await sendEmail({
            to,
            subject: 'Reset Your Keyzoo Password',
            html,
        });

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;