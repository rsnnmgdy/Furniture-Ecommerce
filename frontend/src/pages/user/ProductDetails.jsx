import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Rating,
  Stack,
  Divider,
  TextField,
  IconButton,
  Paper,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  ArrowBack,
  Add,
  Remove,
  LocalShippingOutlined,
  SecurityOutlined,
  ReplayOutlined,
  DeleteOutline,
  EditOutlined,
  WarningAmber,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    ratingCounts: [0, 0, 0, 0, 0],
    totalReviews: 0,
  });

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data.product || data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getProductReviews(id, {});
      const reviewsData = data.reviews || data || [];
      setReviews(reviewsData);

      const counts = [0, 0, 0, 0, 0];
      reviewsData.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
          counts[review.rating - 1] += 1;
        }
      });
      setReviewStats({
        ratingCounts: counts,
        totalReviews: data.total || reviewsData.length,
      });
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(product._id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    const reviewData = {
      product: id,
      rating: reviewRating,
      comment: reviewText,
    };

    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await reviewService.createReview(reviewData);
        toast.success('Review submitted successfully!');
      }
      setEditingReview(null);
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setReviewText(review.comment);
    setReviewRating(review.rating);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewText('');
    setReviewRating(5);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted');
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  // Check if current user owns this review
  const isReviewOwner = (review) => {
    if (!isAuthenticated() || !user || !review.user) return false;
    return user.id === review.user._id || user._id === review.user._id;
  };

  if (loading) return <Loading />;
  if (!product) return null;

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const finalPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* LEFT SIDE: Product Images & Details */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 3 }}>
            {/* Product Image */}
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                mb: 2,
              }}
            >
              {hasDiscount && (
                <Chip
                  label={`-${discountPercent}%`}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontWeight: 700,
                    zIndex: 2,
                  }}
                />
              )}
              <Box
                sx={{
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <img
                  src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/500'}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {product.images.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      border:
                        selectedImage === index
                          ? `2px solid ${theme.palette.primary.main}`
                          : '1px solid #ddd',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Product Details */}
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Chip
              label={product.category}
              size="small"
              sx={{ mb: 2, bgcolor: 'grey.100' }}
            />
            
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, mb: 2 }}>
              {product.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews || 0} reviews)
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                {formatCurrency(finalPrice)}
              </Typography>
              {hasDiscount && (
                <Typography
                  variant="h5"
                  sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                >
                  {formatCurrency(product.price)}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description || 'No description available.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box mb={3}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: product.stock > 0 ? 'success.main' : 'error.main',
                }}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : 'Out of Stock'}
              </Typography>
            </Box>

            {product.stock > 0 && (
              <Box mb={3}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Quantity:
                </Typography>
                <Stack direction="row" spacing={0} alignItems="center">
                  <IconButton
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    size="small"
                    sx={{ border: '1px solid #ddd' }}
                  >
                    <Remove />
                  </IconButton>
                  <Typography
                    sx={{
                      px: 3,
                      minWidth: 60,
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    size="small"
                    sx={{ border: '1px solid #ddd' }}
                  >
                    <Add />
                  </IconButton>
                </Stack>
              </Box>
            )}

            <Stack spacing={2} mb={3}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={isWishlisted ? <Favorite /> : <FavoriteBorder />}
                onClick={() => setIsWishlisted(!isWishlisted)}
                sx={{ py: 1.5, fontSize: '0.95rem', fontWeight: 600 }}
              >
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </Stack>

            <Paper
              elevation={0}
              sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalShippingOutlined color="action" />
                  <Typography variant="body2">Free shipping on orders over $50</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ReplayOutlined color="action" />
                  <Typography variant="body2">30-day return policy</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SecurityOutlined color="action" />
                  <Typography variant="body2">1-year warranty included</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Paper>
        </Grid>

        {/* RIGHT SIDE: Reviews & Ratings */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Customer Reviews
            </Typography>

            {/* Review Stats */}
            <Box sx={{ mb: 4, textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
                {product.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Based on {product.numReviews || 0} reviews
              </Typography>
            </Box>

            {/* Rating Breakdown */}
            <Box sx={{ mb: 4 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewStats.ratingCounts[star - 1] || 0;
                const percentage =
                  reviewStats.totalReviews > 0
                    ? (count / reviewStats.totalReviews) * 100
                    : 0;
                return (
                  <Stack key={star} direction="row" spacing={2} alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {star} star
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Write/Edit Review Form */}
            <Box mb={3} id="review-form">
              {isAuthenticated() ? (
                <Paper
                  elevation={0}
                  sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {editingReview ? 'Edit Your Review' : 'Write a Review'}
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        Your Rating:
                      </Typography>
                      <Rating
                        value={reviewRating}
                        onChange={(e, newValue) => {
                          if (newValue) setReviewRating(newValue);
                        }}
                        size="large"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Share your experience with this product..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      size="small"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={handleReviewSubmit}
                        size="small"
                        sx={{ px: 3 }}
                      >
                        {editingReview ? 'Update' : 'Submit'}
                      </Button>
                      {editingReview && (
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={handleCancelEdit}
                          size="small"
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ) : (
                <Alert severity="info">
                  Please <Link to="/login" style={{ fontWeight: 'bold' }}>Login</Link> to write a review.
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Reviews List */}
            <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                All Reviews ({reviews.length})
              </Typography>
              
              <Stack spacing={2}>
                {reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No reviews yet. Be the first to review!
                  </Typography>
                ) : (
                  reviews.map((review) => {
                    const isOwner = isReviewOwner(review);

                    return (
                      <Paper
                        key={review._id}
                        elevation={0}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, position: 'relative' }}
                      >
                        {/* Show edit/delete buttons ONLY if user owns the review */}
                        {isOwner && (
                          <Stack 
                            direction="row" 
                            spacing={0.5} 
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
                          >
                            <Tooltip title="Edit Your Review">
                              <IconButton
                                aria-label="edit review"
                                size="small"
                                onClick={() => handleEditClick(review)}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Review">
                              <IconButton
                                aria-label="delete review"
                                size="small"
                                onClick={() => handleDeleteReview(review._id)}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                        
                        <Stack direction="row" spacing={2} mb={1}>
                          <Avatar 
                            src={review.user?.photo?.url || ''} 
                            sx={{ width: 36, height: 36 }}
                          >
                            {review.user?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {review.user?.name || 'Anonymous'}
                            </Typography>
                            <Rating value={review.rating} size="small" readOnly />
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(review.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          {review.comment}
                        </Typography>
                        {review.isFiltered && (
                          <Chip
                            icon={<WarningAmber fontSize="small" />}
                            label="Filtered content"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mt: 1, fontSize: '0.7rem' }}
                          />
                        )}
                      </Paper>
                    );
                  })
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
