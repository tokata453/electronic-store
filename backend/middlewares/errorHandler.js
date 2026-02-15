// middleware/errorHandler.js

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any routes
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
};

/**
 * Global Error Handler
 * Catches all errors passed via next(error)
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        status: 400,
        errors
      }
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    return res.status(400).json({
      success: false,
      error: {
        message: `${field} already exists`,
        status: 400
      }
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid reference - related record does not exist',
        status: 400
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        status: 401
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        status: 401
      }
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = { notFound, errorHandler };