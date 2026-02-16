// middleware/admin.js

/**
 * Check if user is admin
 * Must be used AFTER protect middleware
 * Usage: app.delete('/users/:id', protect, admin, handler)
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Admin privileges required.',
        status: 403
      }
    });
  }
};

module.exports = { admin };