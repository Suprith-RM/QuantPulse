const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const stocksController = require('../controllers/stocks.controller');
const router = Router();
/**
 * Validation schemas for this route group
 *
 * Define schemas close to the routes that use them.
 * For schemas shared across multiple route files, move them to
 * a dedicated src/schemas/ folder.
 */
// Validates the :symbol URL parameter
const symbolParamSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Za-z]+$/, 'Symbol must contain only letters'),
});
// Validates the query string for the list endpoint
const listQuerySchema = z.object({
  sortBy: z.enum(['price', 'change', 'symbol', 'volume']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
}).refine(
  (data) => !(data.order && !data.sortBy),
  { message: 'Cannot specify order without sortBy', path: ['order'] },
);
// ─── Routes ───────────────────────────────────────────────────────────────────
// GET /api/v1/stocks
router.get(
  '/',
  validate(listQuerySchema, 'query'),   // Validate query params
  stocksController.getAllStocks,
);
// GET /api/v1/stocks/:symbol
router.get(
  '/:symbol',
  validate(symbolParamSchema, 'params'), // Validate URL params
  stocksController.getStockQuote,
);
module.exports = router;
