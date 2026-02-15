// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Protect routes - verify JWT token
 * Usage: app.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header: "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized to access this route',
          status: 401
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

      // Get user from database (exclude password)
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User no longer exists',
            status: 401
          }
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User account is deactivated',
            status: 401
          }
        });
      }

      // Attach user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = { protect };