import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';
// NOTE: Assuming OrderDetailDialog is available in components/user folder
import OrderDetailDialog from '../../components/user/OrderDetailDialog'; 

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getMyOrders();
      setOrders(response.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
      setIsDialogOpen(false);
      setSelectedOrder(null);
  }
  
  // NEW FUNCTION: Handle Order Cancellation
  const handleCancelOrder = async (orderId) => {
      if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
          return;
      }
      
      try {
          // Call the new service function
          const response = await orderService.cancelOrder(orderId);
          toast.success(`Order #${orderId.slice(-8)} has been cancelled.`);
          
          // Update the local orders state immediately
          setOrders(prevOrders => prevOrders.map(order => 
              order._id === orderId ? response.order : order
          ));
          
      } catch (error) {
          toast.error(error.message || 'Failed to cancel order. Only Pending/Processing orders can be cancelled.');
      }
  };

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No orders yet
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Start shopping to see your orders here!
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        My Orders
      </Typography>

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h6">
                    Order #{order._id.slice(-8)}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={getOrderStatusColor(order.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Placed on {formatDate(order.createdAt)}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {order.orderItems.map((item, index) => (
                  <Box key={index} display="flex" gap={2} mb={2}>
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Order Total
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
                    {formatCurrency(order.totalPrice)}
                  </Typography>

                  {order.trackingNumber && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tracking Number
                      </Typography>
                      <Typography variant="body2">{order.trackingNumber}</Typography>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>

                  {/* CANCELLATION BUTTON - Only show if status is Pending or Processing */}
                  {['Pending', 'Processing'].includes(order.status) ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      fullWidth
                      onClick={() => handleCancelOrder(order._id)} // CALL NEW HANDLER
                    >
                      Cancel Order
                    </Button>
                  ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled
                        sx={{ color: 'text.disabled' }}
                      >
                        {order.status}
                      </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      {/* Order Detail Modal */}
      <OrderDetailDialog 
        open={isDialogOpen}
        order={selectedOrder}
        onClose={handleCloseDialog}
      />
    </Container>
  );
};

export default Orders;