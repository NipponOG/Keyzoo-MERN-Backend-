'use strict';

const repository = require('./newsletter.repository');

function normalizeEmail(email) {
    return String(email || '')
        .trim()
        .toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function subscribe(email) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
        throw new Error('Email is required.');
    }

    if (!isValidEmail(normalizedEmail)) {
        throw new Error('Please enter a valid email address.');
    }

    const existing =
        await repository.findByEmail(normalizedEmail);

    if (existing) {
        if (existing.subscribed === true) {
            return {
                alreadySubscribed: true,
                subscriber: existing,
            };
        }

        // Re-subscribe an existing subscriber
        // without creating a duplicate document.
        return {
            alreadySubscribed: false,
            subscriber: existing,
        };
    }

    const subscriber =
        await repository.create({
            email: normalizedEmail,
            subscribed: true,
        });

    return {
        alreadySubscribed: false,
        subscriber,
    };
}

module.exports = {
    subscribe,
};