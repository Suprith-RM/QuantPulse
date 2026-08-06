const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendValidationError,
} = require('./utils/apiResponse');

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  sendSuccess(res, {
    version: process.env.VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  }, 'QuantPulse API is running');
});

// Stock listing route (with sorting support via query parameters)
app.get('/api/v1/stocks', (req, res) => {
  const stocks = [
    { symbol: 'AAPL', price: 185.42 },
    { symbol: 'GOOGL', price: 2725.60 },
    { symbol: 'AMZN', price: 3342.88 },
    { symbol: 'MSFT', price: 299.35 },
    { symbol: 'TSLA', price: 720.50 },
  ];

  const { sort, order } = req.query;

  if (sort === 'price') {
    stocks.sort((a, b) => {
      return order === 'desc' ? b.price - a.price : a.price - b.price;
    });
  }

  sendSuccess(res, {
    stocks,
    lastUpdated: new Date().toISOString(),
  });
});

// Single stock quote route
app.get('/api/v1/stocks/:symbol', (req, res) => {
  const { symbol } = req.params;

  sendSuccess(res, {
    symbol: symbol.toUpperCase(),
    price: 185.42,
    change: 0.73,
    changePercent: 0.40,
    volume: 45231000,
    lastUpdated: new Date().toISOString(),
  });
});

// Create price alert route
app.post('/api/v1/alerts', (req, res) => {
  const { symbol, targetPrice, condition } = req.body || {};

  const errors = {};
  if (!symbol) errors.symbol = 'Symbol is required';
  if (targetPrice === undefined || targetPrice === null) errors.targetPrice = 'Target price is required';
  if (!condition) errors.condition = 'Condition is required';

  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  const newAlert = {
    id: `alert_${Date.now()}`,
    symbol: symbol.toUpperCase(),
    targetPrice: Number(targetPrice),
    condition,
    createdAt: new Date().toISOString(),
  };

  return sendCreated(res, newAlert, 'Price alert created successfully');
});

// 404 Handler
app.use((req, res) => {
    sendNotFound(res, `Route ${req.method} ${req.path} not found`);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ┌────────────────────────────────────────────────────────────────┐
  │   QuantPulse API Server                                        │
  │   Running on: http://localhost:${PORT}                         │
  │   Environment: ${process.env.NODE_ENV || 'development'}        │
  └────────────────────────────────────────────────────────────────┘
  `);
});

module.exports = app;

