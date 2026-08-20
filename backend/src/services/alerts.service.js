/**
 * Alerts Service — Database Implementation
 *
 * All previous in-memory array operations are replaced with SQL queries.
 * The controller code does NOT change — only the service internals do.
 * This is the power of proper separation of concerns.
 */
const { query } = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Format database alert row into API schema structure
 */
const formatAlertRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    symbol: row.symbol,
    targetPrice: parseFloat(row.target_price),
    condition: row.condition,
    status: row.status,
    triggeredAt: row.triggered_at || null,
    createdAt: row.created_at,
  };
};

/**
 * Get all active alerts (with optional filtering)
 */
const getAllAlerts = async ({ userId = null } = {}) => {
  let sql = `
    SELECT
      id,
      symbol,
      target_price,
      condition,
      status,
      triggered_at,
      created_at
    FROM alerts
    WHERE status != 'deleted'
  `;
  const params = [];

  if (userId) {
    sql += ` AND user_id = $${params.length + 1}`;
    params.push(userId);
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await query(sql, params);
  return result.rows.map(formatAlertRow);
};

/**
 * Get a single alert by ID
 */
const getAlertById = async (id) => {
  const result = await query(
    `SELECT id, symbol, target_price, condition, status, triggered_at, created_at
     FROM alerts WHERE id = $1 AND status != 'deleted'`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return formatAlertRow(result.rows[0]);
};

/**
 * Create a new alert
 */
const createAlert = async ({ symbol, targetPrice, condition, userId = 1 }) => {
  const result = await query(
    `INSERT INTO alerts (user_id, symbol, target_price, condition)
     VALUES ($1, $2, $3, $4)
     RETURNING id, symbol, target_price, condition, status, created_at`,
    [userId || 1, symbol.toUpperCase(), targetPrice, condition]
  );

  return formatAlertRow(result.rows[0]);
};

/**
 * Delete an alert (soft delete — sets status to 'deleted')
 */
const deleteAlert = async (id) => {
  const result = await query(
    `UPDATE alerts SET status = 'deleted'
     WHERE id = $1 AND status != 'deleted'
     RETURNING id`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return { id: result.rows[0].id, deleted: true };
};

module.exports = { getAllAlerts, getAlertById, createAlert, deleteAlert };
