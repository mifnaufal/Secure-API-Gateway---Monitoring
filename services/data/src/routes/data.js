const express = require('express');
const { body } = require('express-validator');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getActivities,
} = require('../controllers/dataController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { cache, invalidateCache } = require('../middleware/cache');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get items with filtering and pagination (cached for 5 minutes)
router.get('/', cache(300), getItems);

// Get activities (cached for 2 minutes)
router.get('/activities', cache(120), getActivities);

// Get single item (cached for 10 minutes)
router.get('/:id', cache(600), getItemById);

// Create item (invalidate cache)
router.post(
  '/',
  [
    body('name').isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().trim(),
    body('category').optional().isLength({ max: 100 }).trim(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    await invalidateCache('');
    next();
  },
  createItem
);

// Update item (invalidate cache)
router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().trim(),
    body('category').optional().isLength({ max: 100 }).trim(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    await invalidateCache('');
    next();
  },
  updateItem
);

// Delete item (invalidate cache)
router.delete('/:id', async (req, res, next) => {
  await invalidateCache('');
  next();
}, deleteItem);

module.exports = router;
