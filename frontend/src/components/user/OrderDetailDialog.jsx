import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Stack, // FIX: Added Stack to imports
} from '@mui/material';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/helpers';

const OrderDetailDialog = ({ open, order, onClose }) => {
  if (!order) return null;

  const statusColor = getOrderStatusColor(order.status);

  // Calculate subtotals robustly
  const itemsSubtotal = order.totalPrice - order.taxPrice - order.shippingPrice;
  const taxRate = itemsSubtotal > 0 ? (order.taxPrice / itemsSubtotal * 100).toFixed(0) : 0;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 700 }}>
        Order #{order._id.slice(-8).toUpperCase()}
      </DialogTitle>
      <DialogContent dividers>
        
        {/* Order Status & Date */}
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Placed on: {formatDate(order.createdAt)}
            </Typography>
            <Chip 
                label={order.status} 
                color={statusColor} 
                size="small" 
                sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Order Items List */}
        <Typography variant="h6" fontWeight={600} mb={1}>
          Items
        </Typography>
        <Stack spacing={1.5} mb={3}>
          {order.orderItems.map((item) => {
            const finalPrice = item.price * item.quantity;
            return (
              <Grid container key={item.product} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight={500}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.quantity} x {formatCurrency(item.price)}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatCurrency(finalPrice)}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        {/* Totals Summary */}
        <Grid container spacing={1} mb={2}>
            <Grid item xs={8}><Typography>Subtotal:</Typography></Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{formatCurrency(itemsSubtotal)}</Typography></Grid>

            <Grid item xs={8}><Typography>Shipping:</Typography></Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</Typography></Grid>

            <Grid item xs={8}><Typography>Tax ({taxRate}%):</Typography></Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography>{formatCurrency(order.taxPrice)}</Typography></Grid>
        </Grid>
        
        <Divider sx={{ mb: 1 }} />
        
        <Grid container alignItems="center">
            <Grid item xs={8}>
                <Typography variant="h6" fontWeight={700}>Total:</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatCurrency(order.totalPrice)}
                </Typography>
            </Grid>
        </Grid>

        {/* Shipping Address */}
        <Box mt={3} p={2} sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Shipping To:
            </Typography>
            <Typography variant="body2">{order.shippingAddress.street}</Typography>
            <Typography variant="body2">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</Typography>
            <Typography variant="body2">{order.shippingAddress.country}</Typography>
            {order.trackingNumber && (
                <Typography variant="body2" mt={1} fontWeight={600}>Tracking: {order.trackingNumber}</Typography>
            )}
        </Box>

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;