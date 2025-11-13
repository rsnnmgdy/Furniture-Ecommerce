const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getMyReviews,
  canUserReview, // Import new function
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, reviewValidation, validate, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, reviewValidation, validate, updateReview);
router.delete('/:id', protect, deleteReview);

// --- ADD THIS NEW ROUTE ---
router.get('/can-review/:productId', protect, canUserReview);
// --- END NEW ROUTE ---

module.exports = router;