'use strict';

const express = require('express');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildVerificationEmail,
} = require('../../services/auth.email.templates');

const router = express.Router();

router.post('/verification-test', async (req, res, next) => {
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

        const verificationUrl =
            'https://keyzoo.shop/verify-email?token=test-verification-token';

        const html = buildVerificationEmail({
            name,
            email: to,
            verificationUrl,
            expiresIn: '30 minutes',
        });

        const result = await sendEmail({
            to,
            subject: 'Verify Your Keyzoo Email Address',
            html,
        });

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;