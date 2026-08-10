/**
 * Watchlists Service
 *
 * In-memory store for watchlists.
 */
const watchlists = [];
let nextId = 1;

const create = async ({ name, symbols = [] }) => {
  const uniqueSymbols = Array.from(new Set(symbols));
  const watchlist = {
    id: nextId++,
    name,
    symbols: uniqueSymbols,
    createdAt: new Date().toISOString(),
  };
  watchlists.push(watchlist);
  return watchlist;
};

const getAll = async () => watchlists;

const getById = async (id) => {
  return watchlists.find((w) => w.id === parseInt(id, 10)) || null;
};

const addSymbol = async (id, symbol) => {
  const watchlist = await getById(id);
  if (!watchlist) return null;

  const upperSymbol = symbol.toUpperCase();
  if (!watchlist.symbols.includes(upperSymbol)) {
    watchlist.symbols.push(upperSymbol);
  }
  return watchlist;
};

const removeSymbol = async (id, symbol) => {
  const watchlist = await getById(id);
  if (!watchlist) return null;

  const upperSymbol = symbol.toUpperCase();
  watchlist.symbols = watchlist.symbols.filter((s) => s !== upperSymbol);
  return watchlist;
};

const deleteWatchlist = async (id) => {
  const index = watchlists.findIndex((w) => w.id === parseInt(id, 10));
  if (index === -1) return null;
  const [deleted] = watchlists.splice(index, 1);
  return deleted;
};

module.exports = {
  create,
  getAll,
  getById,
  addSymbol,
  removeSymbol,
  delete: deleteWatchlist,
  deleteWatchlist,
};
