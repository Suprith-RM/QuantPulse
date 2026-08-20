/**
 * Watchlists Service — Database Implementation
 *
 * All in-memory array operations are replaced with PostgreSQL queries.
 * The controller contract remains identical.
 */
const { query, transaction } = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Create a new watchlist with optional initial symbols
 */
const create = async ({ name, symbols = [], userId = 1 }) => {
  const uniqueSymbols = Array.from(
    new Set((symbols || []).map((s) => s.toUpperCase()))
  );

  return await transaction(async (client) => {
    // 1. Insert watchlist
    const watchlistResult = await client.query(
      `INSERT INTO watchlists (user_id, name)
       VALUES ($1, $2)
       RETURNING id, name, is_default, created_at`,
      [userId || 1, name]
    );

    const watchlist = watchlistResult.rows[0];

    // 2. Insert initial symbols if any
    if (uniqueSymbols.length > 0) {
      for (const symbol of uniqueSymbols) {
        await client.query(
          `INSERT INTO watchlist_symbols (watchlist_id, symbol)
           VALUES ($1, $2)
           ON CONFLICT (watchlist_id, symbol) DO NOTHING`,
          [watchlist.id, symbol]
        );
      }
    }

    return {
      id: watchlist.id,
      name: watchlist.name,
      isDefault: watchlist.is_default,
      symbols: uniqueSymbols,
      createdAt: watchlist.created_at,
    };
  });
};

/**
 * Get all watchlists
 */
const getAll = async ({ userId = null } = {}) => {
  let sql = `
    SELECT
      w.id,
      w.name,
      w.is_default AS "isDefault",
      w.created_at AS "createdAt",
      COALESCE(
        JSON_AGG(ws.symbol ORDER BY ws.added_at ASC) FILTER (WHERE ws.symbol IS NOT NULL),
        '[]'
      ) AS symbols
    FROM watchlists w
    LEFT JOIN watchlist_symbols ws ON w.id = ws.watchlist_id
  `;
  const params = [];

  if (userId) {
    sql += ` WHERE w.user_id = $${params.length + 1}`;
    params.push(userId);
  }

  sql += ` GROUP BY w.id ORDER BY w.created_at DESC`;

  const result = await query(sql, params);

  return result.rows.map((row) => ({
    ...row,
    symbols: typeof row.symbols === 'string' ? JSON.parse(row.symbols) : row.symbols,
  }));
};

/**
 * Get a single watchlist by ID
 */
const getById = async (id) => {
  const result = await query(
    `SELECT
       w.id,
       w.name,
       w.is_default AS "isDefault",
       w.created_at AS "createdAt",
       COALESCE(
         JSON_AGG(ws.symbol ORDER BY ws.added_at ASC) FILTER (WHERE ws.symbol IS NOT NULL),
         '[]'
       ) AS symbols
     FROM watchlists w
     LEFT JOIN watchlist_symbols ws ON w.id = ws.watchlist_id
     WHERE w.id = $1
     GROUP BY w.id`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    symbols: typeof row.symbols === 'string' ? JSON.parse(row.symbols) : row.symbols,
  };
};

/**
 * Add a symbol to a watchlist
 */
const addSymbol = async (id, symbol) => {
  const watchlist = await getById(id);
  if (!watchlist) return null;

  const upperSymbol = symbol.toUpperCase();

  await query(
    `INSERT INTO watchlist_symbols (watchlist_id, symbol)
     VALUES ($1, $2)
     ON CONFLICT (watchlist_id, symbol) DO NOTHING`,
    [id, upperSymbol]
  );

  return await getById(id);
};

/**
 * Remove a symbol from a watchlist
 */
const removeSymbol = async (id, symbol) => {
  const watchlist = await getById(id);
  if (!watchlist) return null;

  const upperSymbol = symbol.toUpperCase();

  await query(
    `DELETE FROM watchlist_symbols
     WHERE watchlist_id = $1 AND symbol = $2`,
    [id, upperSymbol]
  );

  return await getById(id);
};

/**
 * Delete a watchlist
 */
const deleteWatchlist = async (id) => {
  const result = await query(
    `DELETE FROM watchlists WHERE id = $1 RETURNING id, name`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return { id: result.rows[0].id, name: result.rows[0].name, deleted: true };
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
