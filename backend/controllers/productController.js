// controllers/productController.js
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const appError = require('../utils/appError');
const {generatePresignedUrl} = require('../utils/bucket');
const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'name', 'rating', 'reviewCount', 'views', 'stock'];
const ALLOWED_SORT_ORDER = ['ASC', 'DESC'];

const buildProductWhereClause = ({
  search,
  categoryId,
  minPrice,
  maxPrice,
  badge,
  isFeatured,
  includeInactive = false
}) => {
  const where = {};

  if (!includeInactive) {
    where.isActive = true;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  if (badge) {
    where.badge = badge;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured === true || isFeatured === 'true';
  }

  return where;
};

// ═══════════════════════════════════════════════════════════
// HELPER: Add presigned URLs to products
// ═══════════════════════════════════════════════════════════

/**
 * Add presigned URLs to a single product
 */
const addPresignedUrls = async (product) => {
  if (!product) return null;
  
  const productJson = product.toJSON ? product.toJSON() : product;
  
  // Generate presigned URLs for all image keys
  if (productJson.images && Array.isArray(productJson.images)) {
    try {
      productJson.imageUrls = await Promise.all(
        productJson.images.map(key => generatePresignedUrl(key))
      );
    } catch (error) {
      console.error('Error generating presigned URLs:', error);
      productJson.imageUrls = [];
    }
  } else {
    productJson.imageUrls = [];
  }
  
  // Also handle category image if it exists
  if (productJson.category && productJson.category.image) {
    try {
      productJson.category.imageUrl = await generatePresignedUrl(productJson.category.image);
    } catch (error) {
      console.error('Error generating category image URL:', error);
      productJson.category.imageUrl = null;
    }
  }
  
  return productJson;
};

/**
 * Add presigned URLs to multiple products (efficiently)
 */
const addPresignedUrlsToMany = async (products) => {
  if (!products || products.length === 0) return [];
  
  // Convert to JSON if needed
  const productsJson = products.map(p => p.toJSON ? p.toJSON() : p);
  
  // Collect all unique keys that need URLs
  const allKeys = new Set();
  
  productsJson.forEach(product => {
    // Product images
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(key => allKeys.add(key));
    }
    
    // Category image
    if (product.category && product.category.image) {
      allKeys.add(product.category.image);
    }
  });
  
  // Generate all URLs in parallel (much faster!)
  const keyArray = Array.from(allKeys);
  const urlPromises = keyArray.map(key => 
    generatePresignedUrl(key).catch(err => {
      console.error(`Error generating URL for ${key}:`, err);
      return null;
    })
  );
  
  const urls = await Promise.all(urlPromises);
  
  // Create key -> URL map
  const urlMap = {};
  keyArray.forEach((key, index) => {
    if (urls[index]) {
      urlMap[key] = urls[index];
    }
  });
  
  // Add URLs to each product
  productsJson.forEach(product => {
    // Product images
    if (product.images && Array.isArray(product.images)) {
      product.imageUrls = product.images
        .map(key => urlMap[key])
        .filter(Boolean);
    } else {
      product.imageUrls = [];
    }
    
    // Category image
    if (product.category && product.category.image) {
      product.category.imageUrl = urlMap[product.category.image] || null;
    }
  });
  
  return productsJson;
};

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      badge,
      isFeatured,
      includeInactive,
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const canIncludeInactive =
      includeInactive === 'true' &&
      req.user &&
      req.user.role === 'admin';

    const where = buildProductWhereClause({
      search,
      categoryId,
      minPrice,
      maxPrice,
      badge,
      isFeatured,
      includeInactive: canIncludeInactive
    });

    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const safeOrder = ALLOWED_SORT_ORDER.includes(String(order).toUpperCase())
      ? String(order).toUpperCase()
      : 'DESC';
    const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);

    // Pagination
    const offset = (safePage - 1) * safeLimit;

    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [[safeSortBy, safeOrder]],
      limit: safeLimit,
      offset
    });

    const productsWithUrls = await addPresignedUrlsToMany(products);

    res.status(200).json({
      success: true,
      data: {
        products: productsWithUrls,
        pagination: {
          total: count,
          page: safePage,
          pages: Math.ceil(count / safeLimit),
          limit: safeLimit
        }
      }
    });

  } catch (error) {
    return next(new appError('Error fetching products', 500));
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 8, 1), 50);

    const products = await Product.findAll({
      where: { isActive: true, isFeatured: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });

    const productsWithUrls = await addPresignedUrlsToMany(products);

    res.status(200).json({
      success: true,
      data: { products: productsWithUrls }
    });
  } catch (error) {
    next(new appError('Error fetching featured products', 500));
  }
};

const getProductFilters = async (req, res, next) => {
  try {
    const [priceStats, badges] = await Promise.all([
      Product.findOne({
        where: { isActive: true },
        attributes: [
          [Product.sequelize.fn('MIN', Product.sequelize.col('price')), 'minPrice'],
          [Product.sequelize.fn('MAX', Product.sequelize.col('price')), 'maxPrice']
        ],
        raw: true
      }),
      Product.findAll({
        where: {
          isActive: true,
          badge: { [Op.not]: null }
        },
        attributes: ['badge'],
        group: ['badge'],
        order: [['badge', 'ASC']],
        raw: true
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        filters: {
          minPrice: Number(priceStats?.minPrice || 0),
          maxPrice: Number(priceStats?.maxPrice || 0),
          badges: badges.map(item => item.badge).filter(Boolean)
        }
      }
    });
  } catch (error) {
    next(new appError('Error fetching product filters', 500));
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        }
      ]
    });

    if (!product) {
      return next(new appError('Product not found', 404));
    }

    // Increment views
    await product.increment('views');

    const productWithUrls = await addPresignedUrls(product);

    res.status(200).json({
      success: true,
      data: {
        product: productWithUrls
      }
    });

  } catch (error) {
    return next(new appError('Error fetching product', 500));
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'icon']
        }
      ]
    });

    if (!product) {
      return next(new appError('Product not found', 404));
    }

    await product.increment('views');
    const productWithUrls = await addPresignedUrls(product);

    res.status(200).json({
      success: true,
      data: { product: productWithUrls }
    });
  } catch (error) {
    next(new appError('Error fetching product', 500));
  }
};

const getRelatedProducts = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 4, 1), 20);
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return next(new appError('Product not found', 404));
    }

    const relatedConditions = [{ categoryId: product.categoryId }];
    if (product.badge) {
      relatedConditions.push({ badge: product.badge });
    }

    const relatedProducts = await Product.findAll({
      where: {
        isActive: true,
        id: { [Op.ne]: product.id },
        [Op.or]: relatedConditions
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['isFeatured', 'DESC'], ['rating', 'DESC'], ['createdAt', 'DESC']],
      limit
    });

    const productsWithUrls = await addPresignedUrlsToMany(relatedProducts);

    res.status(200).json({
      success: true,
      data: { products: productsWithUrls }
    });
  } catch (error) {
    next(new appError('Error fetching related products', 500));
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      salePrice,
      sku,
      stock,
      categoryId,
      images,
      badge,
      specifications,
      isFeatured
    } = req.body;

    if (!name || price === undefined || price === null || !categoryId) {
      return next(new appError('Please provide name, price, and category', 400));
    }

    if (salePrice !== undefined && salePrice !== null && Number(salePrice) > Number(price)) {
      return next(new appError('Sale price cannot be greater than the regular price', 400));
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return next(new appError('Category not found', 404));
    }

    // Create product
    const product = await Product.create({
      name,
      slug: slug || name.toLowerCase().trim().replace(/\s+/g, '-'),
      description,
      price,
      salePrice,
      sku,
      stock: stock || 0,
      categoryId,
      images,
      badge,
      specifications,
      isFeatured: isFeatured || false,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    return next(new appError('Error creating product', 500));
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return next(new appError('Product not found', 404));
    }

    if (req.body.salePrice !== undefined && req.body.salePrice !== null) {
      const nextPrice = req.body.price !== undefined ? Number(req.body.price) : Number(product.price);
      if (Number(req.body.salePrice) > nextPrice) {
        return next(new appError('Sale price cannot be greater than the regular price', 400));
      }
    }
    
    // Update product
    await product.update(req.body);

    const productWithUrls = await addPresignedUrls(product);

    res.status(200).json({
      success: true,
      data: {
        product: productWithUrls
      }
    });

  } catch (error) {
    return next(new appError('Error updating product', 500));
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Product not found',
          status: 404
        }
      });
    }

    // Soft delete - just mark as inactive
    await product.update({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Product deleted successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductFilters,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
