'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const productRoutes = require('./modules/products/product.routes');
const giftCardRoutes = require('./modules/gift-cards/gift-card.routes');
const gameKeyRoutes = require('./modules/game-keys/game-key.routes');

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

module.exports = app;