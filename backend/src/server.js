const config = require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRouter = require('./routes');
const { sendSuccess, sendNotFound, sendError } = require('./utils/apiResponse');
const AppError = require('./utils/AppError');
const app = express();
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: config.cors.frontendUrl, credentials: true }));
app.use(morgan(config.server.isDevelopment ? 'dev' : 'combined'));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
  }, 'QuantPulse API is running');
});
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);
// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendNotFound(res, `Route ${req.method} ${req.path} not found`);
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be last and must have exactly 4 parameters for Express to recognize it
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Operational errors (AppError): send specific message and status
  if (err instanceof AppError && err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }
  // Zod errors that slipped through (shouldn't happen with our middleware)
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400);
  }
  // Unexpected programming errors: log everything, hide details from client
  console.error('💥 UNEXPECTED ERROR:', err);
  return sendError(res, 'Internal server error', 500);
});
// ─── Start Server ─────────────────────────────────────────────────────────────
const { port, nodeEnv } = config.server;
app.listen(port, () => {
  console.log(`
  ┌──────────────────────────────────────────┐
  │   QuantPulse API                         │
  │   http://localhost:${port}                 │
  │   Environment: ${nodeEnv.padEnd(24)}│
  └──────────────────────────────────────────┘
  `);
});
module.exports = app;
