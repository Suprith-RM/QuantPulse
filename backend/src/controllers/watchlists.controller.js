const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const watchlistsService = require('../services/watchlists.service');

const createWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await watchlistsService.create(req.body);
  sendCreated(res, watchlist, `Watchlist '${watchlist.name}' created successfully`);
});

const getAllWatchlists = asyncHandler(async (req, res) => {
  const watchlists = await watchlistsService.getAll();
  sendSuccess(res, watchlists, null, 200, { count: watchlists.length });
});

const getWatchlistById = asyncHandler(async (req, res) => {
  const watchlist = await watchlistsService.getById(req.params.id);
  if (!watchlist) {
    throw new AppError(`Watchlist with id ${req.params.id} not found`, 404);
  }
  sendSuccess(res, watchlist);
});

const deleteWatchlist = asyncHandler(async (req, res) => {
  const deleted = await watchlistsService.delete(req.params.id);
  if (!deleted) {
    throw new AppError(`Watchlist with id ${req.params.id} not found`, 404);
  }
  sendSuccess(res, null, 'Watchlist deleted successfully', 204);
});

const addSymbol = asyncHandler(async (req, res) => {
  const watchlist = await watchlistsService.addSymbol(req.params.id, req.body.symbol);
  if (!watchlist) {
    throw new AppError(`Watchlist with id ${req.params.id} not found`, 404);
  }
  sendSuccess(res, watchlist, `Symbol '${req.body.symbol}' added to watchlist`);
});

const removeSymbol = asyncHandler(async (req, res) => {
  const watchlist = await watchlistsService.removeSymbol(req.params.id, req.params.symbol);
  if (!watchlist) {
    throw new AppError(`Watchlist with id ${req.params.id} not found`, 404);
  }
  sendSuccess(res, watchlist, `Symbol '${req.params.symbol}' removed from watchlist`);
});

module.exports = {
  createWatchlist,
  getAllWatchlists,
  getWatchlistById,
  deleteWatchlist,
  addSymbol,
  removeSymbol,
};
