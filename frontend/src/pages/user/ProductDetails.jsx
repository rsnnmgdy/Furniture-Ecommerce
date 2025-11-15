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
import ReviewList from '../../components/user/ReviewList';
import ReviewForm from '../../components/user/ReviewForm';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    ratingCounts: [0, 0, 0, 0, 0], // Index 0 = 1 star, Index 4 = 5 stars
    totalReviews: 0,
  });

  // State for review form
  const [editingReview, setEditingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false); // NEW STATE: Controls visibility
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated()) {
      checkUserReviewStatus();
    } else {
      setReviewLoading(false);
      setCanReview(false);
      setReviewError('You must be logged in to review.');
    }
  }, [id, isAuthenticated, reviews]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data.product);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getProductReviews(id);
      setReviews(data.reviews);

      // Calculate review stats
      const counts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
      data.reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
          counts[review.rating - 1] += 1;
        }
      });
      setReviewStats({
        ratingCounts: counts,
        totalReviews: data.total,
      });
    } catch (error) {
      console.error('Failed to load reviews');
    }
  };

  const checkUserReviewStatus = async () => {
    try {
      setReviewLoading(true);
      setReviewError('');
      const data = await reviewService.checkCanReview(id);
      if (data.canReview) {
        setCanReview(true);
        setEditingReview(null);
        setShowReviewForm(false); // Initially hide the form
      } else {
        setCanReview(false);
        if (data.review) {
          // User already reviewed, enable editing capability but hide the form
          setEditingReview(data.review);
          setShowReviewForm(false); // HIDE FORM BY DEFAULT
          setReviewError('You have already reviewed this product.');
        } else if (data.message) {
          // User has not purchased
          setReviewError(data.message);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      setReviewError('Could not verify review status.');
    } finally {
      setReviewLoading(false);
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

  const handleReviewSubmit = async ({ rating, comment }) => {
    const reviewData = {
      productId: id,
      rating: rating,
      comment: comment,
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
      setCanReview(false);
      setShowReviewForm(false); // HIDE FORM after submission
      fetchReviews();
      fetchProduct();
    } catch (error) {
      // FIX: Catch 400 validation errors from backend service
      toast.error(error.message || error.data?.message || 'Failed to submit review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowReviewForm(true); // SHOW FORM when Edit is clicked
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowReviewForm(false); // HIDE FORM when Cancel is clicked
    setReviewError('You have already reviewed this product.');
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

  if (loading) return <Loading />;
  if (!product) return null;

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const finalPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)} // Go back
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
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

            {product.images && product.images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description || 'No description available.'}
            </Typography>

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
                  >
                    <Remove />
                  </IconButton>
                  <Typography
                    sx={{
                      px: 2,
                      minWidth: 40,
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    size="small"
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
              variant="outlined"
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
          </Grid>
        </Grid>
      </Paper>

      <Box mt={6}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Customer Reviews
        </Typography>

        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {product.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Based on {product.numReviews || 0} reviews
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewStats.ratingCounts[star - 1] || 0; 
                const percentage =
                  reviewStats.totalReviews > 0
                    ? (count / reviewStats.totalReviews) * 100
                    : 0;
                return (
                  <Stack key={star} direction="row" spacing={2} alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {star} star{count !== 1 ? 's' : ''}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Grid>
          </Grid>
        </Paper>

        <Box mb={4} id="review-form">
          {/* FIX: Form visibility controlled by showReviewForm state */}
          {showReviewForm ? (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              editingReview={editingReview}
              onCancelEdit={handleCancelEdit}
              initialRating={editingReview ? editingReview.rating : 5}
              initialText={editingReview ? editingReview.comment : ''}
            />
          ) : (
            !isAuthenticated() ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Please <Link to="/login" style={{ fontWeight: 'bold' }}>Login</Link> to write a review.
              </Alert>
            ) : (
              // FIX: Show 'Write a Review' or 'Edit Your Review' button only if user is authorized (canReview or has editingReview data)
              (canReview || editingReview) && (
                <Stack direction="row" justifyContent="center" mb={2}>
                    <Button 
                        variant="contained" 
                        onClick={() => setShowReviewForm(true)}
                        startIcon={editingReview ? <EditOutlined /> : null}
                    >
                        {editingReview ? "Edit Your Review" : "Write a Review"}
                    </Button>
                </Stack>
              )
            )
          )}
        </Box>

        <ReviewList
          reviews={reviews}
          currentUserId={user?.id}
          isAdmin={user?.role === 'admin'}
          onDelete={handleDeleteReview}
          onEdit={handleEditClick}
        />
      </Box>
    </Container>
  );
};

export default ProductDetails;