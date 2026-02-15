// utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {number} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;