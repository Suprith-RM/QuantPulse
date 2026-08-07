const { sendValidationError } = require('../utils/apiResponse');
/**
 * validate — Zod Schema Validation Middleware Factory
 *
 * WHY A FACTORY FUNCTION:
 * Different routes validate different things (body, params, query).
 * By accepting a 'source' parameter, one middleware handles all cases:
 *   validate(schema)             → validates req.body (default)
 *   validate(schema, 'params')  → validates req.params
 *   validate(schema, 'query')   → validates req.query
 *
 * HOW TO USE:
 *   router.post('/alerts', validate(createAlertSchema), controller.createAlert);
 *   The route handler only runs if validation passes. Otherwise a 400 is returned.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    // Format Zod errors into readable field-level messages
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return sendValidationError(res, errors);
  }
  // Replace req[source] with the validated (and possibly transformed) data
  // e.g. if schema has .toUpperCase(), req.body.symbol is now uppercase
  req[source] = result.data;
  next();
};
module.exports = validate;