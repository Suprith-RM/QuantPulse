const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const stocksService = require('../services/stocks.service');
/**
 * Stocks Controller
 *
 * The controller's ONLY job:
 * 1. Extract data from req (params, query, body)
 * 2. Call the appropriate service function
 * 3. Send the response using our standard helpers
 *
 * It contains NO business logic. If you find yourself writing
 * if/else for business rules here, move that logic to the service.
 */
/**
 * GET /api/v1/stocks/:symbol
 * Returns a single stock quote
 */
const getStockQuote = asyncHandler(async (req, res) => {
  // req.params.symbol was already validated by the validate middleware
  const { symbol } = req.params;
  const data = await stocksService.getQuoteBySymbol(symbol);
  sendSuccess(res, data);
});
/**
 * GET /api/v1/stocks
 * Returns all stock quotes, optional sorting via query params
 */
const getAllStocks = asyncHandler(async (req, res) => {
  // req.query contains parsed query string: ?sortBy=price&order=desc
  const { sortBy, order } = req.query;
  const data = await stocksService.getAllQuotes({ sortBy, order });
  sendSuccess(res, data, null, 200, { count: data.length });
});
module.exports = { getStockQuote, getAllStocks };
