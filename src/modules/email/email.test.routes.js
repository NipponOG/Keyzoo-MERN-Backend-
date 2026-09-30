'use strict';

const express = require('express');

const { sendEmail } =
    require('../../services/email.service');

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

        const result = await sendEmail({
            to,
            subject: 'Keyzoo Email Delivery Test',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Keyzoo Email Test</h2>

                    <p>
                        This is a test email from the Keyzoo backend.
                    </p>

                    <p>
                        If you received this email, Resend is
                        configured correctly.
                    </p>

                    <p>
                        <strong>Keyzoo</strong>
                    </p>
                </div>
            `,
        });

        res.status(200).json({
            success: true,
            message: 'Test email sent successfully.',
            emailId: result?.id ?? null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;