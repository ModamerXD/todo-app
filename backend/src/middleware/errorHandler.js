const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
};

module.exports = { validate, errorHandler };
