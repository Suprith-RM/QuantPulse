/**
 * Alerts Service
 *
 * In-memory store for now. Phase 3 replaces this with PostgreSQL.
 * Notice: the API contract (function signatures) won't change
 * when we swap the implementation — only the internals.
 * This is the Dependency Inversion principle in practice.
 */
const alerts = []; // Will be replaced by DB query in Phase 3
let nextId = 1;
const createAlert = async ({ symbol, targetPrice, condition, userId = null }) => {
  const alert = {
    id: nextId++,
    symbol,
    targetPrice,
    condition,
    userId,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  return alert;
};
const getAlertById = async (id) => {
  return alerts.find((a) => a.id === parseInt(id, 10)) || null;
};
const getAllAlerts = async () => alerts;
const deleteAlert = async (id) => {
  const index = alerts.findIndex((a) => a.id === parseInt(id, 10));
  if (index === -1) return null;
  const [deleted] = alerts.splice(index, 1);
  return deleted;
};
module.exports = { createAlert, getAlertById, getAllAlerts, deleteAlert };
