'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Latest smartphones from top brands including iPhone, Samsung, Google Pixel, and more',
        icon: '📱',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'High-performance laptops for work, gaming, and everyday use',
        icon: '💻',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        description: 'Portable tablets and iPads perfect for entertainment and productivity',
        icon: '📱',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Headphones',
        slug: 'headphones',
        description: 'Premium wireless and wired headphones with superior sound quality',
        icon: '🎧',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Smartwatches',
        slug: 'smartwatches',
        description: 'Smart watches and fitness trackers to monitor your health and stay connected',
        icon: '⌚',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Essential accessories for your devices - cases, chargers, cables, and more',
        icon: '🔌',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ 6 product categories created');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
