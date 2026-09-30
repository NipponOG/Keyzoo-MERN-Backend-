'use strict';

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({
    to,
    subject,
    html,
}) {
    if (!to) {
        throw new Error('Email recipient is required.');
    }

    if (!subject) {
        throw new Error('Email subject is required.');
    }

    if (!html) {
        throw new Error('Email HTML content is required.');
    }

    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
    });

    if (error) {
        console.error('❌ Resend email failed:', error);

        const emailError = new Error(
            error.message || 'Failed to send email.'
        );

        emailError.statusCode = 502;

        throw emailError;
    }

    console.log('📧 Email sent successfully:', {
        id: data?.id ?? null,
        to,
        subject,
    });

    return data;
}

module.exports = {
    sendEmail,
};