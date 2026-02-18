// controllers/authController.js
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide all required fields',
          status: 400
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email already registered',
          status: 400
        }
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by model hook
      phone,
      role: 'customer' // Default role
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and password',
          status: 400
        }
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          status: 401
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};