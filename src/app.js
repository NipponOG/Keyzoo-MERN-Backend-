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
const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const orderRoutes = require('./modules/orders/order.routes');

const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (req, res) => {
    res.json({
        success: true,
        message: 'Keyzoo backend is running',
    });
});

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/gift-cards', giftCardRoutes);
app.use('/api/v1/game-keys', gameKeyRoutes);
app.use('/api/v1/admin/game-keys', gameKeyAdminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use('/api/v1/admin/orders', orderRoutes);

app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/inventory', inventoryRoutes);

app.use(errorMiddleware);

module.exports = app;