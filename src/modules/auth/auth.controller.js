'use strict';

const authService = require('./auth.service');
const { verifyTurnstileToken } = require('../../utils/turnstile');

async function register(req, res, next) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
            turnstileToken,
        } = req.body;

        const turnstileValid = await verifyTurnstileToken(
            turnstileToken,
            req.ip
        );

        if (!turnstileValid) {
            const error = new Error('Security verification failed');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.registerUser({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
        });

        res.status(201).json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });
        
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const {
            email,
            identifier,
            password,
            turnstileToken,
        } = req.body;

        const turnstileValid = await verifyTurnstileToken(
            turnstileToken,
            req.ip
        );

        if (!turnstileValid) {
            const error = new Error('Security verification failed');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.loginUser({
            email: email || identifier,
            password,
        });

        res.json({
            success: true,
            jwt: result.jwt,
            user: result.user,
        });
    } catch (error) {
        next(error);
    }
}

async function getCurrentUser(req, res, next) {
    try {
        const user = await authService.getCurrentUser(
            req.user.userId
        );

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
};