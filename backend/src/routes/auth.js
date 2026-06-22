const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be 3–50 characters.')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username may only contain letters, numbers, and underscores.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number.')
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);

module.exports = router;
