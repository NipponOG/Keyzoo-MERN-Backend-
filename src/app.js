'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const heroBannerRoutes = require('./modules/hero-banners/hero-banner.routes');
const gameBannerRoutes = require('./modules/game-banners/game-banner.routes');
const promoBannerRoutes = require('./modules/promo-banners/promo-banner.routes');
const categoryBannerRoutes = require('./modules/category-banners/category-banner.routes');
const adBannerRoutes = require('./modules/ad-banners/ad-banner.routes');

const searchRoutes = require('./modules/search/search.routes');
const newsletterRoutes = require('./modules/newsletter/newsletter.routes');

const productRoutes = require('./modules/products/product.routes');
const giftCardRoutes = require('./modules/gift-cards/gift-card.routes');
const gameKeyRoutes = require('./modules/game-keys/game-key.routes');
const gameKeyAdminRoutes = require('./modules/game-keys/game-key.admin.routes');

const paymentRoutes = require('./modules/payments/payment.routes');

const errorMiddleware = require('./middleware/error.middleware');
const maintenanceMiddleware = require('./middleware/maintenance.middleware');

const heroBannerAdminRoutes = require('./modules/hero-banners/hero-banner.admin.routes');
const gameBannerAdminRoutes = require('./modules/game-banners/game-banner.admin.routes');
const promoBannerAdminRoutes = require('./modules/promo-banners/promo-banner.admin.routes');
const categoryBannerAdminRoutes = require('./modules/category-banners/category-banner.admin.routes');
const adBannerAdminRoutes = require('./modules/ad-banners/ad-banner.admin.routes');

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
app.use('/api/v1/payments/stripe/webhook',
    express.raw({
        type: 'application/json',
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────

app.get('/api/v1/health', (req, res) => { res.json({ success: true, message: 'Keyzoo backend is running', }); });

// ─────────────────────────────────────────────
// Maintenance status
// Public GET + Admin PUT
// ─────────────────────────────────────────────

app.use('/api/v1/maintenance', maintenanceRoutes);

// ─────────────────────────────────────────────
// Customer routes
// Maintenance protected
// ─────────────────────────────────────────────

app.use('/api/v1/search', maintenanceMiddleware, searchRoutes);
app.use('/api/v1/newsletter', maintenanceMiddleware, newsletterRoutes);
app.use('/api/v1/products', maintenanceMiddleware, productRoutes);
app.use('/api/v1/gift-cards', maintenanceMiddleware, giftCardRoutes);
app.use('/api/v1/game-keys', maintenanceMiddleware, gameKeyRoutes);
app.use('/api/v1/auth', maintenanceMiddleware, authRoutes);
app.use('/api/v1/home/hero', maintenanceMiddleware, heroBannerRoutes);
app.use('/api/v1/home/game-banners', maintenanceMiddleware, gameBannerRoutes);
app.use('/api/v1/home/promo-banners', maintenanceMiddleware, promoBannerRoutes);
app.use('/api/v1/home/category-banners', maintenanceMiddleware, categoryBannerRoutes);
app.use('/api/v1/home/ad-banners', maintenanceMiddleware, adBannerRoutes);

app.use('/api/v1/payments/stripe/webhook', paymentRoutes);
app.use('/api/v1/payments', maintenanceMiddleware, paymentRoutes);

// ─────────────────────────────────────────────
// Admin routes
// NOT blocked by maintenance mode
// ─────────────────────────────────────────────

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/game-keys', gameKeyAdminRoutes);
app.use('/api/v1/admin/orders', orderRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/inventory', inventoryRoutes);
app.use('/api/v1/admin/products', productAdminRoutes);
app.use('/api/v1/admin/gift-cards', giftCardAdminRoutes);
app.use('/api/v1/admin/media', mediaRoutes);
app.use('/api/v1/admin/hero-banners', heroBannerAdminRoutes);
app.use('/api/v1/admin/game-banners', gameBannerAdminRoutes);
app.use('/api/v1/admin/promo-banners', promoBannerAdminRoutes);
app.use('/api/v1/admin/category-banners', categoryBannerAdminRoutes);
app.use('/api/v1/admin/ad-banners', adBannerAdminRoutes);

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────

app.use(errorMiddleware);


module.exports = app;