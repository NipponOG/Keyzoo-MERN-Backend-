'use strict';

const express = require('express');

const {
    sendEmail,
} = require('../../services/email.service');

const {
    buildOtpEmail,
} = require('../../services/auth.email.templates');

const router = express.Router();

router.post('/otp-test', async (req, res, next) => {
    try {
        const {
            to,
            name = 'Nippan',
            otp = '482913',
        } = req.body;

        if (!to) {
            const error = new Error(
                'Recipient email is required.'
            );

            error.statusCode = 400;
            throw error;
        }

        const html = buildOtpEmail({
            name,
            email: to,
            otp,
            expiresIn: '10 minutes',
        });

        const result = await sendEmail({
            to,
            subject: 'Your Keyzoo Verification Code',
            html,
        });

        res.status(200).json({
            success: true,
            message: 'OTP email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;