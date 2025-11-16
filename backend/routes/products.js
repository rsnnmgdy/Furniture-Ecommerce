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
  getFeaturedProducts, // Kept for compatibility
  getTopRatedProducts, // NEW
  getNewArrivals, // NEW
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');
const { productValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts); // Legacy
router.get('/top-rated', getTopRatedProducts); // NEW
router.get('/new-arrivals', getNewArrivals); // NEW
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  handleUploadError(uploadProductImages.array('images', 10)),
  (req, res, next) => {
    console.log('📝 POST /products - Files received:', req.files?.length || 0);
    console.log('📝 POST /products - Body keys:', req.body ? Object.keys(req.body) : 'NO BODY');
    next();
  },
  productValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  handleUploadError(uploadProductImages.array('images', 10)),
  (req, res, next) => {
    console.log('📝 PUT /products/:id - Files received:', req.files?.length || 0);
    console.log('📝 PUT /products/:id - Body keys:', req.body ? Object.keys(req.body) : 'NO BODY');
    next();
  },
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