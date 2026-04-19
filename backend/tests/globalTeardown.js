process.env.NODE_ENV = 'test';
require('dotenv').config();

const { Op } = require('sequelize');
const { User, Order, OrderItem, Cart, CartItem, Product, Category } = require('../models');

const TEST_EMAIL_PATTERNS = [
  'admin-analytics-%@test.com',
  'customer-analytics-%@test.com',
  'customer-cart-%@test.com',
  'admin-order-%@test.com',
  'customer-order-%@test.com',
  'oauth-test-%@test.com',
  'oauth-new-%@test.com',
  'oauth-new-provider-%@test.com',
  'oauth-new-avatar-%@test.com',
  'oauth-token-%@test.com',
  'link-test-%@test.com',
  'link-fb-%@test.com',
  'dup-test-%@test.com',
  'multi-oauth-%@test.com',
  'switch-oauth-%@test.com',
  'admin-upload-%@test.com',
  'customer-upload-%@test.com',
  'auth_test_%@example.com',
  'integration_%@example.com'
];

module.exports = async () => {
  try {
    const users = await User.findAll({
      attributes: ['id'],
      where: {
        email: {
          [Op.or]: TEST_EMAIL_PATTERNS.map(pattern => ({ [Op.like]: pattern }))
        }
      }
    });

    const userIds = users.map(user => user.id);

    if (userIds.length) {
      const orders = await Order.findAll({
        attributes: ['id'],
        where: { userId: userIds }
      });
      const orderIds = orders.map(order => order.id);

      if (orderIds.length) {
        await OrderItem.destroy({ where: { orderId: orderIds } });
        await Order.destroy({ where: { id: orderIds } });
      }

      const carts = await Cart.findAll({
        attributes: ['id'],
        where: { userId: userIds }
      });
      const cartIds = carts.map(cart => cart.id);

      if (cartIds.length) {
        await CartItem.destroy({ where: { cartId: cartIds } });
        await Cart.destroy({ where: { id: cartIds } });
      }

      await User.destroy({ where: { id: userIds }, force: true });
    }

    // Always sweep integration products/categories even if no matching users were found.
    const products = await Product.findAll({
      attributes: ['id'],
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%integration%' } },
          { slug: { [Op.iLike]: '%integration%' } },
          { description: { [Op.iLike]: '%integration%' } }
        ]
      }
    });
    const productIds = products.map(product => product.id);

    if (productIds.length) {
      await CartItem.destroy({ where: { productId: productIds } });
      await OrderItem.destroy({ where: { productId: productIds } });
      await Product.destroy({ where: { id: productIds }, force: true });
    }

    await Category.destroy({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%integration%' } },
          { slug: { [Op.iLike]: 'integration-category-%' } },
          { description: { [Op.iLike]: '%integration%' } }
        ]
      }
    });
  } catch (error) {
    console.warn('Global teardown cleanup skipped:', error.message);
  }
};
