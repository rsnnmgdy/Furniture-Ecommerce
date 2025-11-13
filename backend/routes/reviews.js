const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getMyReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, reviewValidation, validate, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, reviewValidation, validate, updateReview);

// Admin routes
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
