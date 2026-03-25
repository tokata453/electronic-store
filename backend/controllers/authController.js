// controllers/authController.js
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const passport = require('../config/passport');

/**
 * @desc    Register new user 
 * @route   POST /api/auth/register 
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validate required fields
    if (!firstName || !lastName || !normalizedEmail || !password) {
      return next(new AppError('Please provide all required fields', 400));      
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password, // Will be hashed by model hook
      phone,
      role: 'customer' // Default role
    });

    // Generate token
    const token = generateToken(user);

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
    const normalizedEmail = email?.trim().toLowerCase();

    // Validate required fields
    if (!normalizedEmail || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken(user);

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

const googleCallbackHandler = (req, res) => {
  try {
    const token = generateToken({ id: req.user.id, email: req.user.email, role: req.user.role });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

const facebookCallbackHandler = (req, res) => {
  try {
    const token = generateToken({ id: req.user.id, email: req.user.email, role: req.user.role });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleCallbackHandler,
  facebookCallbackHandler
};
