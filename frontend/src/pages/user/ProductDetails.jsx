import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Rating,
  Card,
  CardMedia,
  Stack,
  Divider,
  TextField,
  IconButton,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  ArrowBack,
  Add,
  Remove,
  LocalShipping,
  Security,
  ReplayOutlined,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
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
      setReviews(data);
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

  const handleSubmitReview = async () => {
    if (!isAuthenticated()) {
      toast.info('Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      await reviewService.createReview(id, {
        rating: reviewRating,
        comment: reviewText,
      });
      toast.success('Review submitted successfully!');
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
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
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'hidden',
                borderRadius: 2,
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
              <CardMedia
                component="img"
                image={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/500'}
                alt={product.name}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Paper>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
              {product.images.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    border: selectedImage === index ? '2px solid #8B4513' : '1px solid #ddd',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: '#8B4513',
                    },
                  }}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Chip label={product.category} size="small" sx={{ mb: 2 }} />
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {product.name}
            </Typography>

            {/* Rating */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.numReviews || 0} reviews)
              </Typography>
            </Stack>

            {/* Price */}
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B4513' }}>
                ${finalPrice.toFixed(2)}
              </Typography>
              {hasDiscount && (
                <>
                  <Typography
                    variant="h5"
                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                  >
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Chip
                    label={`Save ${discountPercent}%`}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description || 'No description available.'}
            </Typography>

            {/* Stock Status */}
            <Box mb={3}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Availability:</strong>{' '}
                {product.stock > 0 ? (
                  <span style={{ color: 'green' }}>In Stock ({product.stock} available)</span>
                ) : (
                  <span style={{ color: 'red' }}>Out of Stock</span>
                )}
              </Typography>
            </Box>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <Box mb={3}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Quantity:
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Paper elevation={0} sx={{ display: 'flex', border: '1px solid #ddd' }}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                    <Box
                      sx={{
                        px: 3,
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 60,
                        justifyContent: 'center',
                      }}
                    >
                      <Typography fontWeight={600}>{quantity}</Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      size="small"
                    >
                      <Add />
                    </IconButton>
                  </Paper>
                </Stack>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack spacing={2} mb={3}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: '#8B4513',
                  '&:hover': {
                    backgroundColor: '#654321',
                  },
                }}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={isWishlisted ? <Favorite /> : <FavoriteBorder />}
                onClick={() => setIsWishlisted(!isWishlisted)}
                sx={{
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </Stack>

            {/* Benefits */}
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalShipping color="primary" />
                  <Typography variant="body2">Free shipping on orders over $50</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ReplayOutlined color="primary" />
                  <Typography variant="body2">30-day return policy</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Security color="primary" />
                  <Typography variant="body2">1-year warranty included</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box mt={6}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Customer Reviews
        </Typography>

        {/* Review Stats */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} textAlign="center">
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {product.averageRating?.toFixed(1) || '0.0'}
              </Typography>
              <Rating value={product.averageRating || 0} precision={0.5} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" mt={1}>
                Based on {product.numReviews || 0} reviews
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
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
                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                      {count}
                    </Typography>
                  </Stack>
                );
              })}
            </Grid>
          </Grid>
        </Paper>

        {/* Write Review */}
        {isAuthenticated() && (
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Write a Review
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Rating:
                </Typography>
                <Rating
                  value={reviewRating}
                  onChange={(e, newValue) => setReviewRating(newValue)}
                  size="large"
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                sx={{ alignSelf: 'flex-start' }}
              >
                Submit Review
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Reviews List */}
        <Stack spacing={3}>
          {reviews.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No reviews yet. Be the first to review!
            </Typography>
          ) : (
            reviews.map((review) => (
              <Paper key={review._id} elevation={1} sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} mb={2}>
                  <Avatar>{review.user?.name?.charAt(0) || 'U'}</Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {review.user?.name || 'Anonymous'}
                    </Typography>
                    <Rating value={review.rating} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2">{review.comment}</Typography>
              </Paper>
            ))
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default ProductDetails;
