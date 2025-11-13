import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  Edit,
  Print,
  Mail,
  Visibility,
  Download,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #C67C4E 0%, #8B6F47 100%)';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updateData, setUpdateData] = useState({ status: '', trackingNumber: '' });

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
      await orderService.updateOrderStatus(selectedOrder._id, updateData.status, updateData.trackingNumber);
      toast.success('Order updated!');
      setDialogOpen(false);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #FAFAFA; }
          .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { border-bottom: 3px solid #C67C4E; padding-bottom: 20px; margin-bottom: 20px; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #C67C4E; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #F5F5F5; padding: 12px; text-align: left; border-bottom: 2px solid #E8E8E8; font-weight: 600; }
          .items-table td { padding: 12px; border-bottom: 1px solid #EFEFEF; }
          .total-row { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 3px solid #C67C4E; color: #C67C4E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="invoice-title">INVOICE</div>
            <div class="detail-row"><span>Order ID: #${order._id.slice(-8).toUpperCase()}</span><span>Date: ${formatDate(order.createdAt)}</span></div>
          </div>
          <div class="header">
            <h3>Customer Information</h3>
            <div class="detail-row"><span>Name: ${order.user?.name}</span></div>
            <div class="detail-row"><span>Email: ${order.user?.email}</span></div>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td><td>$${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="detail-row"><span>Subtotal:</span><span>$${(order.totalPrice * 0.9).toFixed(2)}</span></div>
          <div class="detail-row"><span>Shipping:</span><span>$${(order.shippingCost || 0).toFixed(2)}</span></div>
          <div class="detail-row total-row"><span>Total:</span><span>$${order.totalPrice.toFixed(2)}</span></div>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  if (loading) return <Loading />;

  const getStatusColor = (status) => {
    const colors = {
      'Pending': { bg: '#FFF3E0', color: '#F57C00' },
      'Processing': { bg: '#E3F2FD', color: '#1976D2' },
      'Shipped': { bg: '#F3E5F5', color: '#7B1FA2' },
      'Delivered': { bg: '#E8F5E9', color: '#2E7D32' },
      'Cancelled': { bg: '#FFEBEE', color: '#C62828' }
    };
    return colors[status] || { bg: '#F5F5F5', color: '#666' };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} sx={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Orders
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Manage customer orders and shipments
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
          <CardContent sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" fontWeight={700}>{orders.length}</Typography>
            <Typography variant="caption" color="textSecondary">Total Orders</Typography>
          </CardContent>
        </Card>
        {orderStatuses.map(status => (
          <Card key={status} sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{orders.filter(o => o.status === status).length}</Typography>
              <Typography variant="caption" color="textSecondary">{status}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filter */}
      <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={statusFilter} label="Filter by Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Orders</MenuItem>
              {orderStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <TableRow key={order._id} sx={{ '&:hover': { backgroundColor: '#FAFAFA' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>#{order._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>{order.user?.name}</TableCell>
                    <TableCell>{order.orderItems.length}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#C67C4E' }}>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" sx={{ background: statusColor.bg, color: statusColor.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#666', fontSize: '14px' }}>{formatDate(order.createdAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => { setSelectedOrder(order); setUpdateData({ status: order.status, trackingNumber: order.trackingNumber || '' }); setDialogOpen(true); }} sx={{ color: '#C67C4E' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handlePrintInvoice(order)} sx={{ color: '#8B6F47' }}>
                        <Print fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredOrders.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} sx={{ borderTop: '1px solid #EFEFEF', backgroundColor: '#FAFAFA' }} />
      </Card>

      {/* Update Order Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700 }}>
          Update Order #{selectedOrder?._id.slice(-8).toUpperCase()}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Stepper activeStep={orderStatuses.indexOf(selectedOrder.status)}>
                {orderStatuses.map(status => <Step key={status}><StepLabel>{status}</StepLabel></Step>)}
              </Stepper>
              <Divider />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={updateData.status} label="Status" onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}>
                  {orderStatuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Tracking Number" fullWidth value={updateData.trackingNumber} onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ background: PRIMARY_GRADIENT }} onClick={handleUpdateStatus}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
