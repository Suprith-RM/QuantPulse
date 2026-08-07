/**
 * asyncHandler — Higher Order Function for Async Route Handlers
 *
 * WHY WE NEED THIS:
 * In Express, if an async function throws (rejects), you must call next(error)
 * to pass it to the global error handler. Without this, the request hangs
 * indefinitely.
 *
 * Instead of wrapping every route in try-catch (repetitive and easy to forget),
 * this utility wraps the function automatically. If it throws, the error
 * is automatically passed to next(), which reaches our global error handler.
 *
 * BEFORE (every route needs its own try-catch):
 *   app.get('/route', async (req, res, next) => {
 *     try { ... } catch(e) { next(e); }
 *   });
 *
 * AFTER (clean, no boilerplate):
 *   app.get('/route', asyncHandler(async (req, res) => {
 *     // any thrown error is automatically caught
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = asyncHandler;