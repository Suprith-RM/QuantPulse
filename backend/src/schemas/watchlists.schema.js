const { z } = require('zod');

/**
 * Watchlists Schemas
 */

const symbolSchema = z
  .string()
  .min(1, 'Symbol cannot be empty')
  .max(10, 'Symbol must be at most 10 characters')
  .regex(/^[A-Za-z]+$/, 'Symbol must contain only letters')
  .transform((val) => val.toUpperCase());

const createWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters'),
  symbols: z.array(symbolSchema).optional().default([]),
});

const addSymbolSchema = z.object({
  symbol: symbolSchema,
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer'),
});

const idAndSymbolParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer'),
  symbol: symbolSchema,
});

module.exports = {
  createWatchlistSchema,
  watchlistSchema: createWatchlistSchema,
  addSymbolSchema,
  idParamSchema,
  idAndSymbolParamSchema,
};