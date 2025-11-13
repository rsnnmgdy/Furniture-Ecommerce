const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  deleteProductImage,
  getFeaturedProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');
const { productValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadProductImages.array('images', 10), // Max 10 images
  productValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadProductImages.array('images', 10),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

router.post(
  '/bulk-delete',
  protect,
  authorize('admin'),
  bulkDeleteProducts
);

router.delete(
  '/:id/images/:imageId',
  protect,
  authorize('admin'),
  deleteProductImage
);

module.exports = router;
