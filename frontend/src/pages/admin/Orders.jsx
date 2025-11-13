import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Collapse,
  Grid,
  Divider,
  Badge,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  Edit,
  ExpandMore,
  ExpandLess,
  PrintOutlined,
  MailOutline,
  LocalShipping,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const OrderTimeline = ({ order }) => {
  const getTimelineSteps = () => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(order.status);
    return steps.map((step) => {
      const stepIndex = steps.indexOf(step);
      let status = 'inactive';
      if (stepIndex < currentIndex) status = 'completed';
      if (stepIndex === currentIndex) status = 'active';
      return { label: step, status };
    });
  };

  const steps = getTimelineSteps();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={2}>
        Order Timeline
      </Typography>
      <Stepper activeStep={steps.findIndex((s) => s.status === 'active')}>
        {steps.map((step) => (
          <Step key={step.label} completed={step.status === 'completed'}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updateData, setUpdateData] = useState({
    status: '',
    trackingNumber: '',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders({ limit: 100 });
      setOrders(response.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateOrderStatus(
        selectedOrder._id,
        updateData.status,
        updateData.trackingNumber
      );
      toast.success('Order updated! Email sent to customer.');
      setDialogOpen(false);
      setExpandedOrder(null);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleResendEmail = async () => {
    try {
      await orderService.resendOrderEmail(selectedOrder._id);
      toast.success('Email sent to customer successfully');
    } catch {
      toast.error('Failed to send email');
    }
  };

  const openUpdateDialog = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
    });
    setDialogOpen(true);
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .invoice-details { margin-bottom: 20px; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f0f0f0; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total-row { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">INVOICE</div>
          <div class="detail-row">
            <span>Order ID: #${order._id.slice(-8)}</span>
            <span>Date: ${formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div class="invoice-details">
          <h3>Customer Information</h3>
          <div class="detail-row">
            <span>Name: ${order.user?.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span>Email: ${order.user?.email || 'N/A'}</span>
          </div>
        </div>

        <div class="invoice-details">
          <h3>Shipping Address</h3>
          <div class="detail-row">
            <span>${order.shippingAddress?.address || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}</span>
          </div>
        </div>

        <h3>Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map((item) => `
              <tr>
                <td>${item.name || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="invoice-details">
          <div class="detail-row">
            <span>Subtotal:</span>
            <span>$${((order.totalPrice - (order.shippingCost || 0) + (order.discount || 0)) / (1 + (order.taxRate || 0.1))).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span>Shipping:</span>
            <span>$${(order.shippingCost || 0).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span>Tax:</span>
            <span>$${(order.totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <div class="detail-row total-row">
            <span>Total:</span>
            <span>$${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div class="invoice-details">
          <h3>Order Status: ${order.status}</h3>
          ${order.trackingNumber ? `<div class="detail-row">Tracking Number: ${order.trackingNumber}</div>` : ''}
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Orders Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Orders</MenuItem>
            {orderStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{orders.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {orders.filter((o) => o.status === 'Pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {orders.filter((o) => o.status === 'Shipped').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shipped
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              ${orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell fontWeight={600}>Order ID</TableCell>
              <TableCell fontWeight={600}>Customer</TableCell>
              <TableCell fontWeight={600}>Items</TableCell>
              <TableCell fontWeight={600}>Total</TableCell>
              <TableCell fontWeight={600}>Status</TableCell>
              <TableCell fontWeight={600}>Date</TableCell>
              <TableCell fontWeight={600}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <React.Fragment key={order._id}>
                  <TableRow hover>
                    <TableCell>#{order._id.slice(-8)}</TableCell>
                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                    <TableCell>{order.orderItems.length} items</TableCell>
                    <TableCell fontWeight={600}>
                      {formatCurrency(order.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getOrderStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order._id ? null : order._id)
                        }
                        title={expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      >
                        {expandedOrder === order._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openUpdateDialog(order)}
                        title="Update Status"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Order Details */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={expandedOrder === order._id} timeout="auto">
                        <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                          <Grid container spacing={3}>
                            {/* Timeline */}
                            <Grid item xs={12}>
                              <OrderTimeline order={order} />
                            </Grid>

                            {/* Order Items */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                                Order Items
                              </Typography>
                              {order.orderItems.map((item, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    py: 1,
                                    borderBottom: '1px solid #ddd',
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Qty: {item.quantity}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatCurrency(item.price * item.quantity)}
                                  </Typography>
                                </Box>
                              ))}
                            </Grid>

                            {/* Shipping & Totals */}
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                                Shipping Address
                              </Typography>
                              <Typography variant="body2">
                                {order.shippingAddress?.address}
                              </Typography>
                              <Typography variant="body2">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                                {order.shippingAddress?.zipCode}
                              </Typography>

                              <Divider sx={{ my: 2 }} />

                              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                                Order Totals
                              </Typography>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">
                                  ${(order.totalPrice * 0.9).toFixed(2)}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Shipping:</Typography>
                                <Typography variant="body2">
                                  $
                                  {(order.totalPrice * 0.1 * 0.2).toFixed(2)}
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                fontWeight={600}
                                sx={{ pt: 1, borderTop: '1px solid #ddd' }}
                              >
                                <Typography variant="body2" fontWeight={600}>
                                  Total:
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {formatCurrency(order.totalPrice)}
                                </Typography>
                              </Box>

                              {order.trackingNumber && (
                                <>
                                  <Divider sx={{ my: 2 }} />
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <LocalShipping fontSize="small" />
                                    <Typography variant="body2">
                                      <strong>Tracking:</strong> {order.trackingNumber}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Box display="flex" gap={2} mt={3}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PrintOutlined />}
                              onClick={() => handlePrintInvoice(order)}
                            >
                              Print Invoice
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MailOutline />}
                              onClick={handleResendEmail}
                            >
                              Resend Email
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => openUpdateDialog(order)}
                            >
                              Update Status
                            </Button>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredOrders.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Update Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Order ID: #{selectedOrder?._id.slice(-8)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Customer: {selectedOrder?.user?.name}
            </Typography>

            <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={updateData.status}
                label="Status"
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
              >
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {updateData.status === 'Shipped' && (
              <TextField
                fullWidth
                label="Tracking Number"
                value={updateData.trackingNumber}
                onChange={(e) =>
                  setUpdateData({ ...updateData, trackingNumber: e.target.value })
                }
                helperText="Email with tracking info will be sent to customer"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus}>
            Update & Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
