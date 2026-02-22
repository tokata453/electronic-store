'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('customer', 'admin'),
        defaultValue: 'customer',
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // OAuth fields (included from the start)
      googleId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      facebookId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      githubId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });
    
    await queryInterface.addIndex('users', ['googleId'], {
      unique: true,
      name: 'users_google_id_index'
    });
    
    await queryInterface.addIndex('users', ['facebookId'], {
      unique: true,
      name: 'users_facebook_id_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};