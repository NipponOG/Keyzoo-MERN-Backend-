'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const productRoutes = require('./modules/products/product.routes');
const giftCardRoutes = require('./modules/gift-cards/gift-card.routes');
const gameKeyRoutes = require('./modules/game-keys/game-key.routes');
const gameKeyAdminRoutes = require('./modules/game-keys/game-key.admin.routes');

const errorMiddleware = require('./middleware/error.middleware');
const maintenanceMiddleware = require('./middleware/maintenance.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const orderRoutes = require('./modules/orders/order.routes');
const mediaRoutes = require('./modules/media/media.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');

const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');

const productAdminRoutes = require('./modules/products/product.admin.routes');
const giftCardAdminRoutes = require('./modules/gift-cards/gift-card.admin.routes');

const app = express();


// ─────────────────────────────────────────────
// Global middleware
// ─────────────────────────────────────────────

app.use(helmet());

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Keyzoo backend is running',
    });
});


// ─────────────────────────────────────────────
// Maintenance status
// Public GET + Admin PUT
// ─────────────────────────────────────────────

app.use(
    '/api/v1/maintenance',
    maintenanceRoutes
);


// ─────────────────────────────────────────────
// Customer routes
// Maintenance protected
// ─────────────────────────────────────────────

app.use(
    '/api/v1/products',
    maintenanceMiddleware,
    productRoutes
);

app.use(
    '/api/v1/gift-cards',
    maintenanceMiddleware,
    giftCardRoutes
);

app.use(
    '/api/v1/game-keys',
    maintenanceMiddleware,
    gameKeyRoutes
);

app.use(
    '/api/v1/auth',
    maintenanceMiddleware,
    authRoutes
);


// ─────────────────────────────────────────────
// Admin routes
// NOT blocked by maintenance mode
// ─────────────────────────────────────────────

app.use(
    '/api/v1/admin',
    adminRoutes
);

app.use(
    '/api/v1/admin/game-keys',
    gameKeyAdminRoutes
);

app.use(
    '/api/v1/admin/orders',
    orderRoutes
);

app.use(
    '/api/v1/admin/dashboard',
    dashboardRoutes
);

app.use(
    '/api/v1/admin/inventory',
    inventoryRoutes
);

app.use(
    '/api/v1/admin/products',
    productAdminRoutes
);

app.use(
    '/api/v1/admin/gift-cards',
    giftCardAdminRoutes
);

app.use(
    '/api/v1/admin/media',
    mediaRoutes
);


// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────

app.use(errorMiddleware);


module.exports = app;