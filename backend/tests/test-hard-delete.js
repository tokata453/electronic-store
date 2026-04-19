require("dotenv").config();
const { Product, CartItem, OrderItem } = require("../models");
const { Op } = require("sequelize");
async function clean() {
  try {
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: "%integration%" } },
          { slug: { [Op.iLike]: "%integration%" } },
          { description: { [Op.iLike]: "%integration%" } },
        ],
      },
    });
    const ids = products.map((p) => p.id);
    console.log(
      "Products to delete:",
      products.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
    );
    if (ids.length > 0) {
      const cartDel = await CartItem.destroy({
        where: { productId: ids },
        force: true,
      }).catch((err) => {
        console.warn(
          "CartItem deletion failed (check original column name):",
          err.message,
        );
        return CartItem.destroy({ where: { product_id: ids }, force: true });
      });
      const orderDel = await OrderItem.destroy({
        where: { productId: ids },
        force: true,
      }).catch((err) => {
        console.warn(
          "OrderItem deletion failed (check original column name):",
          err.message,
        );
        return OrderItem.destroy({ where: { product_id: ids }, force: true });
      });
      const prodDel = await Product.destroy({
        where: { id: ids },
        force: true,
      });
      console.log("Cart Items deleted:", cartDel);
      console.log("Order Items deleted:", orderDel);
      console.log("Products deleted:", prodDel);
    } else {
      console.log("No products found matching criteria.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clean();
