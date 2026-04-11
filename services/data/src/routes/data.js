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

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get items with filtering and pagination
router.get('/', getItems);

// Get activities
router.get('/activities', getActivities);

// Get single item
router.get('/:id', getItemById);

// Create item
router.post(
  '/',
  [
    body('name').isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().trim(),
    body('category').optional().isLength({ max: 100 }).trim(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  createItem
);

// Update item
router.put(
  '/:id',
  [
    body('name').optional().isLength({ min: 1, max: 255 }).trim(),
    body('description').optional().isString().trim(),
    body('category').optional().isLength({ max: 100 }).trim(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  updateItem
);

// Delete item (soft delete)
router.delete('/:id', deleteItem);

module.exports = router;
