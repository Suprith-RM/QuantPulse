const { Router } = require('express');
const stocksRouter = require('./stocks.routes');
const alertsRouter = require('./alerts.routes');
const router = Router();
/**
 * API v1 Router
 *
 * This is the single entry point for all v1 routes.
 * Adding a new feature? Create its router and add one line here.
 * server.js never needs to change.
 */
router.use('/stocks', stocksRouter);
router.use('/alerts', alertsRouter);
// Export for use in server.js
module.exports = router;
