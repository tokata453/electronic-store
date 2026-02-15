// controllers/categoryController.js
const { Category, Product } = require('../models');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description', 'icon', 'image', 'sortOrder']
    });

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category with products
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: false,
          attributes: [
            'id', 'name', 'slug', 'price', 'salePrice', 
            'images', 'badge', 'rating', 'reviewCount', 'stock'
          ]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          status: 404
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image, sortOrder } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide category name',
          status: 400
        }
      });
    }

    // Create category
    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon,
      image,
      sortOrder: sortOrder || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          status: 404
        }
      });
    }

    // Update category
    await category.update(req.body);

    res.status(200).json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Category not found',
          status: 404
        }
      });
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: category.id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`,
          status: 400
        }
      });
    }

    // Soft delete
    await category.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Category deleted successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};