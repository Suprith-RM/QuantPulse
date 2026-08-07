const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendNotFound } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const alertsService = require('../services/alerts.service');
const createAlert = asyncHandler(async (req, res) => {
  // req.body is already validated and transformed by validate() middleware
  const alert = await alertsService.createAlert(req.body);
  sendCreated(res, alert, `Alert created for ${alert.symbol}`);
});
const getAllAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertsService.getAllAlerts();
  sendSuccess(res, alerts, null, 200, { count: alerts.length });
});
const getAlert = asyncHandler(async (req, res) => {
  const alert = await alertsService.getAlertById(req.params.id);
  if (!alert) throw new AppError(`Alert with id ${req.params.id} not found`, 404);
  sendSuccess(res, alert);
});
const deleteAlert = asyncHandler(async (req, res) => {
  const deleted = await alertsService.deleteAlert(req.params.id);
  if (!deleted) throw new AppError(`Alert with id ${req.params.id} not found`, 404);
  sendSuccess(res, null, 'Alert deleted successfully', 204);
});
module.exports = { createAlert, getAllAlerts, getAlert, deleteAlert };
