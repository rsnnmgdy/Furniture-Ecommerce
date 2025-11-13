import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart, getCartTotal } = useCart();

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <Loading />;

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add some products to get started!
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const price = product.salePrice || product.price;

            return (
              <Card key={item._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* Product Image */}
                    <Grid item xs={3} sm={2}>
                      <img
                        src={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    </Grid>

                    {/* Product Info */}
                    <Grid item xs={9} sm={4}>
                      <Typography
                        variant="h6"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(price)} each
                      </Typography>
                      {product.stock < 10 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Only {product.stock} left in stock!
                        </Alert>
                      )}
                    </Grid>

                    {/* Quantity Controls */}
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Subtotal & Remove */}
                    <Grid item xs={6} sm={3}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(price * item.quantity)}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemove(product._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tax (8%):</Typography>
              <Typography>{formatCurrency(tax)}</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>Shipping:</Typography>
              <Typography>
                {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
              </Typography>
            </Box>

            {shipping > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Free shipping on orders over $500!
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Total:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                {formatCurrency(total)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;
