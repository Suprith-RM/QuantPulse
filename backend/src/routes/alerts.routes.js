const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const alertsController = require('../controllers/alerts.controller');
const { createAlertSchema } = require('../schemas/alerts.schema');
const router = Router();
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer'),
});
router.get('/', alertsController.getAllAlerts);
router.post('/', validate(createAlertSchema), alertsController.createAlert);
router.get('/:id', validate(idParamSchema, 'params'), alertsController.getAlert);
router.delete('/:id', validate(idParamSchema, 'params'), alertsController.deleteAlert);
module.exports = router;
