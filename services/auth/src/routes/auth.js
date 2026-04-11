const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getProfile, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { trackActivity } = require('../middleware/activityTracker');

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 30 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  trackActivity('register'),
  register
);

router.post(
  '/login',
  [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').notEmpty(),
  ],
  validate,
  trackActivity('login'),
  login
);

router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticateToken, trackActivity('logout'), logout);
router.get('/me', authenticateToken, getProfile);
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  trackActivity('change_password'),
  changePassword
);

module.exports = router;
