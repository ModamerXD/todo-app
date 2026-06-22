const router = require('express').Router();
const { body, param, query } = require('express-validator');
const {
  getAllTodos, getTodo, createTodo, updateTodo, deleteTodo, getStats
} = require('../controllers/todoController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

// All todo routes require authentication
router.use(authenticate);

const uuidParam = param('id').isUUID().withMessage('Invalid todo ID format.');

router.get('/', getAllTodos);
router.get('/stats', getStats);

router.get('/:id', uuidParam, validate, getTodo);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 255 }).withMessage('Title max 255 chars.'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }).withMessage('Description max 2000 chars.'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high.'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
  ],
  validate,
  createTodo
);

router.patch(
  '/:id',
  [
    uuidParam,
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 255 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean.'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high.'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
  ],
  validate,
  updateTodo
);

router.delete('/:id', uuidParam, validate, deleteTodo);

module.exports = router;
