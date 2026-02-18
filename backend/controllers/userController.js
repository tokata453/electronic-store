// controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, address } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Update allowed fields only
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (address) updateData.address = address;

    await user.update(updateData);

    // Return user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide current password and new password',
          status: 400
        }
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'New password must be at least 6 characters',
          status: 400
        }
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          status: 404
        }
      });
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          status: 401
        }
      });
    }

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      data: {
        message: 'Password updated successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};