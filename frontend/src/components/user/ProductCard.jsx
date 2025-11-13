import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  Typography,
  Stack,
  Box,
  IconButton,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isWishlisted, onToggleWishlist, onAddToCart }) => {
  const navigate = useNavigate();

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const finalPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%', // Makes card fill the grid item
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {hasDiscount && (
          <Chip
            label={`-${discountPercent}%`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 700,
              zIndex: 2,
              fontSize: '0.7rem',
            }}
          />
        )}
        <CardMedia
          component="img"
          image={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
          alt={product.name}
          onClick={() => navigate(`/product/${product._id}`)}
          sx={{
            aspectRatio: '1/1',
            objectFit: 'contain',
            width: '100%',
            p: 2,
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        <IconButton
          aria-label="add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product._id);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          {isWishlisted ? (
            <Favorite sx={{ color: 'error.main' }} />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1, px: 2 }}>
        <Chip
          label={product.category}
          size="small"
          sx={{ mb: 1, fontSize: '0.7rem', height: 20, bgcolor: 'grey.100' }}
        />
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          onClick={() => navigate(`/product/${product._id}`)}
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.4,
            minHeight: '2.8em',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            mb: 1,
            color: 'text.primary',
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {product.name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <Rating
            value={product.averageRating || 0}
            precision={0.5}
            size="small"
            readOnly
          />
          <Typography variant="caption" color="text.secondary">
            ({product.numReviews || 0})
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            ${finalPrice.toFixed(2)}
          </Typography>
          {hasDiscount && (
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
            >
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onAddToCart(product._id)}
          disabled={product.stock === 0}
          sx={{
            py: 1.25,
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              transform: 'translateY(-1px)'
            },
          }}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;