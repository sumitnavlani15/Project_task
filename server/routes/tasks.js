const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Task = require('../models/Task');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
];

// GET tasks — list with filtering, sorting, pagination
router.get(
  '/',
  [
    query('status').optional().isIn(['todo', 'in-progress', 'done']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
    query('sort').optional().isIn(['createdAt', '-createdAt', 'dueDate', '-dueDate', 'priority', 'title']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const { status, priority, sort = '-createdAt', page = 1, limit = 50, search } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [tasks, total] = await Promise.all([
        Task.find(filter).sort(sort).skip(skip).limit(Number(limit)),
        Task.countDocuments(filter),
      ]);

      res.json({
        tasks,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET tasks/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    const result = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    stats.forEach(({ _id, count }) => {
      result[_id] = count;
      result.total += count;
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET tasks/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// POST tasks
router.post('/', taskValidation, handleValidation, async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT tasks/:id — full update
router.put(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID'), ...taskValidation],
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH tasks/:id — partial update (e.g. toggle status)
router.patch(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, {
        new: true,
        runValidators: true,
      });
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE tasks/:id
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  handleValidation,
  async (req, res, next) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted successfully', id: req.params.id });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
