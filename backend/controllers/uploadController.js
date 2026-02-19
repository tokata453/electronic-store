// controllers/uploadController.js
const { uploadFile, deleteFile, keyFromUrl } = require('../utils/bucket');
const { Product, Category, User } = require('../models');
const appError = require('../utils/appError');

// ─────────────────────────────────────────────
// 📦 PRODUCT IMAGES
// ─────────────────────────────────────────────

/**
 * @desc    Upload product images (up to 5)
 * @route   POST /api/upload/product/:productId
 * @access  Private/Admin
 *
 * - Accepts up to 5 images
 * - Uploads all to Railway Bucket under /products/
 * - Saves URLs to product.images array in database
 */
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
        return next(new appError('Please upload at least one image', 400));
    }

    // 2. Find product
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return next(new appError('Product not found', 404));
    }

    // 3. Upload all images to bucket in parallel
    const uploadPromises = req.files.map((file) =>
      uploadFile(file.buffer, 'products', file.mimetype, file.originalname)
    );
    const results = await Promise.all(uploadPromises);

    // 4. Merge with existing images (keep old + add new)
    const existingImages = product.images || [];
    const newUrls = results.map((r) => r.url);
    const allImages = [...existingImages, ...newUrls];

    // 5. Save to database
    await product.update({ images: allImages });

    res.status(200).json({
      success: true,
      data: {
        message: `${req.files.length} image(s) uploaded successfully`,
        uploadedUrls: newUrls,
        allImages,
        product: {
          id: product.id,
          name: product.name,
          images: allImages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific product image
 * @route   DELETE /api/upload/product/:productId/image
 * @access  Private/Admin
 *
 * Body: { "imageUrl": "https://bucket.railway.app/.../products/xxx.jpg" }
 */
const deleteProductImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return next(new appError('imageUrl is required in request body', 400));
    }

    // 1. Find product
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return next(new appError('Product not found', 404));
    }

    // 2. Remove from bucket
    const key = keyFromUrl(imageUrl);
    if (key) await deleteFile(key);

    // 3. Remove URL from product.images array
    const updatedImages = (product.images || []).filter((url) => url !== imageUrl);
    await product.update({ images: updatedImages });

    res.status(200).json({
      success: true,
      data: {
        message: 'Image deleted successfully',
        remainingImages: updatedImages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 📁 CATEGORY IMAGE
// ─────────────────────────────────────────────

/**
 * @desc    Upload category image
 * @route   POST /api/upload/category/:categoryId
 * @access  Private/Admin
 *
 * - Accepts 1 image
 * - Uploads to /categories/ in bucket
 * - Replaces old image if one existed
 */
const uploadCategoryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(appError('Please upload an image', 400));
    }

    // 2. Find category
    const category = await Category.findByPk(req.params.categoryId);
    if (!category) {
      return next(appError('Category not found', 404));
    }

    // 3. Delete old image from bucket (if exists)
    if (category.image) {
      const oldKey = keyFromUrl(category.image);
      if (oldKey) await deleteFile(oldKey);
    }

    // 4. Upload new image
    const { url } = await uploadFile(
      req.file.buffer,
      'categories',
      req.file.mimetype,
      req.file.originalname
    );

    // 5. Save to database
    await category.update({ image: url });

    res.status(200).json({
      success: true,
      data: {
        message: 'Category image uploaded successfully',
        imageUrl: url,
        category: {
          id: category.id,
          name: category.name,
          image: url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 👤 USER AVATAR
// ─────────────────────────────────────────────

/**
 * @desc    Upload current user's avatar
 * @route   POST /api/upload/avatar
 * @access  Private (any logged-in user)
 *
 * - Accepts 1 image
 * - Uploads to /avatars/ in bucket
 * - Replaces old avatar if one existed
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(appError('Please upload an image', 400));
    }

    // 2. Find user (from protect middleware)
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(appError('User not found', 404));
    }

    // 3. Delete old avatar from bucket (if exists)
    if (user.avatar) {
      const oldKey = keyFromUrl(user.avatar);
      if (oldKey) await deleteFile(oldKey);
    }

    // 4. Upload new avatar
    const { url } = await uploadFile(
      req.file.buffer,
      'avatars',
      req.file.mimetype,
      req.file.originalname
    );

    // 5. Save to database
    await user.update({ avatar: url });

    res.status(200).json({
      success: true,
      data: {
        message: 'Avatar uploaded successfully',
        avatarUrl: url,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadProductImages,
  deleteProductImage,
  uploadCategoryImage,
  uploadAvatar,
};