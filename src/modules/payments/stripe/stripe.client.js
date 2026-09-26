'use strict';

const Stripe = require('stripe');

const env = require('../../../config/env');

if (!env.payments.stripe.secretKey) {
    throw new Error(
        'STRIPE_SECRET_KEY is not defined'
    );
}

const stripe = new Stripe(
    env.payments.stripe.secretKey
);

module.exports = stripe;