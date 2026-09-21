'use strict';

const service = require('./newsletter.service');

async function subscribe(req, res, next) {
    try {
        const { email } = req.body;

        const result = await service.subscribe(email);

        if (result.alreadySubscribed) {
            return res.json({
                success: true,
                alreadySubscribed: true,
                message: "You're already subscribed!",
            });
        }

        return res.status(201).json({
            success: true,
            alreadySubscribed: false,
            message: 'Thank you for subscribing!',
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    subscribe,
};