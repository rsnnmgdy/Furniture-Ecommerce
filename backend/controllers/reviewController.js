const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { filterBadWords, hasBadWords } = require('../utils/badWordsFilter');

// @desc    Create review (MP3 - 10pts)
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'orderItems.product': productId,
      status: { $in: ['Delivered', 'Completed'] }, // Only allow reviews for delivered/completed orders
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products you have purchased',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Filter bad words (Unit 1 requirement)
    let filteredComment = comment;
    let isFiltered = false;

    if (hasBadWords(comment)) {
      filteredComment = filterBadWords(comment);
      isFiltered = true;
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment: filteredComment,
      isFiltered,
    });

    // Populate user data
    await review.populate('user', 'name photo');

    // Update product rating
    await product.calculateAverageRating();

    res.status(201).json({
      success: true,
      message: isFiltered
        ? 'Review created successfully (some words were filtered)'
        : 'Review created successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name photo')
      .sort(sort)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update own review (MP3 - 5pts)
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update fields
    if (req.body.rating) review.rating = req.body.rating;

    if (req.body.comment) {
      // Filter bad words
      let filteredComment = req.body.comment;
      let isFiltered = false;

      if (hasBadWords(req.body.comment)) {
        filteredComment = filterBadWords(req.body.comment);
        isFiltered = true;
      }

      review.comment = filteredComment;
      review.isFiltered = isFiltered;
    }

    await review.save();
    await review.populate('user', 'name photo');

    // Update product rating
    const product = await Product.findById(review.product);
    await product.calculateAverageRating();

    res.json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete review (User or Admin)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // --- PERMISSION LOGIC ---
    // Check if user is the review author OR an admin
    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review',
      });
    }
    // --- END LOGIC ---

    const productId = review.product;
    await review.deleteOne(); // Use deleteOne()

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      await product.calculateAverageRating();
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name images price')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
exports.canUserReview = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'orderItems.product': productId,
      status: { $in: ['Delivered', 'Completed'] },
    });

    if (!hasPurchased) {
      return res.json({ success: true, canReview: false, message: 'Must purchase to review.' });
    }

    // 2. Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingReview) {
      return res.json({ success: true, canReview: false, message: 'Already reviewed.', review: existingReview });
    }

    // If purchased and not reviewed, they can review
    res.json({ success: true, canReview: true });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// --- END NEW FUNCTION ---