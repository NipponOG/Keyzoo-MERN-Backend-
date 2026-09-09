'use strict';

const authService = require('../auth/auth.service');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await authService.loginAdmin({
            email,
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

async function getCurrentAdmin(req, res) {
    res.json({
        success: true,
        user: {
            id: req.user.userId,
            role: req.user.role,
        },
    });
}

module.exports = {
    login,
    getCurrentAdmin,
};