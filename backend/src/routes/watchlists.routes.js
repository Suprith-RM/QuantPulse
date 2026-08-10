const { Router } = require('express');
const validate = require('../middleware/validate');
const watchlistsController = require('../controllers/watchlists.controller');
const {
  createWatchlistSchema,
  addSymbolSchema,
  idParamSchema,
  idAndSymbolParamSchema,
} = require('../schemas/watchlists.schema');

const router = Router();

router.get('/', watchlistsController.getAllWatchlists);
router.post('/', validate(createWatchlistSchema), watchlistsController.createWatchlist);
router.get('/:id', validate(idParamSchema, 'params'), watchlistsController.getWatchlistById);
router.delete('/:id', validate(idParamSchema, 'params'), watchlistsController.deleteWatchlist);

router.post(
  '/:id/symbols',
  validate(idParamSchema, 'params'),
  validate(addSymbolSchema, 'body'),
  watchlistsController.addSymbol
);

router.delete(
  '/:id/symbols/:symbol',
  validate(idAndSymbolParamSchema, 'params'),
  watchlistsController.removeSymbol
);

module.exports = router;
