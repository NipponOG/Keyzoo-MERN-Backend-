'use strict';

function createNewsletterSubscriberDocument(data = {}) {
    const now = new Date();

    return {
        email: String(data.email || '')
            .trim()
            .toLowerCase(),

        subscribed: data.subscribed ?? true,
        subscribedAt: data.subscribedAt ?? now,
        createdAt: data.createdAt ?? now,
        updatedAt: now,
    };
}

module.exports = {
    createNewsletterSubscriberDocument,
};