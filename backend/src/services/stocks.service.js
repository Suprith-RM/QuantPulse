const AppError = require('../utils/AppError');
/**
 * Stocks Service
 *
 * This is where ALL business logic for stock data lives.
 * It knows nothing about HTTP (no req, res, next).
 * This makes it testable independently from Express.
 *
 * Right now we return mock data. In Phase 3, this will query
 * the PostgreSQL database. In Phase 7, this will call
 * a real market data API. The controller never changes.
 */
// Mock data — will be replaced with real DB/API calls in later phases
const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.42, change: 0.73, changePercent: 0.40, volume: 45231000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.20, change: -0.55, changePercent: -0.39, volume: 22100000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 2.10, changePercent: 0.56, volume: 18500000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.20, changePercent: -1.27, volume: 88200000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 1.05, changePercent: 0.59, volume: 34100000 },
];
/**
 * Get a single stock quote by symbol
 * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL')
 * @returns {Object} Stock quote data
 * @throws {AppError} 404 if symbol not found
 */
const getQuoteBySymbol = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const stock = MOCK_STOCKS.find((s) => s.symbol === upperSymbol);
  if (!stock) {
    // Using AppError so the global handler knows to send a 404
    throw new AppError(`Stock symbol '${upperSymbol}' not found`, 404);
  }
  return {
    ...stock,
    lastUpdated: new Date().toISOString(),
  };
};
/**
 * Get all available stock quotes, with optional sorting
 * @param {Object} options
 * @param {string} options.sortBy - Field to sort by ('price', 'change', 'symbol')
 * @param {string} options.order - Sort direction ('asc', 'desc')
 * @returns {Array} Array of stock quotes
 */
const getAllQuotes = async ({ sortBy, order } = {}) => {
  let stocks = [...MOCK_STOCKS];
  if (sortBy && ['price', 'change', 'symbol', 'volume'].includes(sortBy)) {
    stocks.sort((a, b) => {
      if (order === 'desc') return b[sortBy] > a[sortBy] ? 1 : -1;
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
  }
  return stocks.map((stock) => ({
    ...stock,
    lastUpdated: new Date().toISOString(),
  }));
};
module.exports = { getQuoteBySymbol, getAllQuotes };
