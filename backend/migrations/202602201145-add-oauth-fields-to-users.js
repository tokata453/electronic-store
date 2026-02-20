// migrations/YYYYMMDDHHMMSS-add-oauth-fields-to-users.js
// Add OAuth provider fields to users table

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'googleId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'facebookId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'provider', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'OAuth provider: local, google, facebook, github',
    });

    // Add indexes for OAuth IDs for faster lookups
    await queryInterface.addIndex('users', ['googleId'], {
      name: 'users_google_id_index',
    });

    await queryInterface.addIndex('users', ['facebookId'], {
      name: 'users_facebook_id_index',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('users', 'users_google_id_index');
    await queryInterface.removeIndex('users', 'users_facebook_id_index');

    // Remove columns
    await queryInterface.removeColumn('users', 'googleId');
    await queryInterface.removeColumn('users', 'facebookId');
    await queryInterface.removeColumn('users', 'provider');
  },
};