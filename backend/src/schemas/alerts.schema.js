const { z } = require('zod');
/**
 * Shared Schemas
 *
 * WHY A SEPARATE SCHEMAS FILE:
 * The createAlertSchema might be needed in multiple places:
 *   - The route (for validation)
 *   - Tests (to generate valid test data)
 *   - Documentation generation
 * Keeping it in its own file makes it reusable.
 */
const createAlertSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Za-z]+$/, 'Symbol must contain only letters')
    .transform((val) => val.toUpperCase()), // Auto-uppercase before saving
  targetPrice: z
    .number({ invalid_type_error: 'targetPrice must be a number' })
    .positive('targetPrice must be greater than 0')
    .finite()
    .max(1000000, 'targetPrice must be less than or equal to 1,000,000'),
  condition: z.enum(['above', 'below'], {
    errorMap: () => ({ message: "condition must be either 'above' or 'below'" }),
  }),
});
module.exports = { createAlertSchema };
