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
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Divider,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  ExpandMore,
  ExpandLess,
  Block,
  CheckCircle,
  VpnKey,
  History,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [orderHistoryDialogOpen, setOrderHistoryDialogOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      
      const response = await api.get(`/admin/users?${params.toString()}&limit=100`);
      setUsers(response.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateRole = async (role) => {
    try {
      await api.put(`/admin/users/${selectedUser._id}/role`, { role });
      toast.success(`User role updated to ${role}`);
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleBlock = async () => {
    try {
      const newStatus = !selectedUser.isBlocked;
      await api.put(`/admin/users/${selectedUser._id}/block`, { isBlocked: newStatus });
      toast.success(newStatus ? 'User blocked successfully' : 'User unblocked successfully');
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user block status');
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      await api.put(`/admin/users/${selectedUser._id}/password`, { password: newPassword });
      toast.success('Password reset successfully');
      setPasswordDialogOpen(false);
      setNewPassword('');
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleViewOrderHistory = async (user) => {
    try {
      const response = await api.get(`/admin/users/${user._id}/orders`);
      setUserOrders(response.orders || []);
      setSelectedUser(user);
      setOrderHistoryDialogOpen(true);
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to load order history');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Loading />;

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Users Management
      </Typography>

      {/* --- GRID V2 SYNTAX FIX --- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{users.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {users.filter((u) => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admins
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {users.filter((u) => u.isBlocked).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Blocked Users
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {users.filter((u) => u.role === 'user').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Regular Users
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={roleFilter}
            label="Filter by Role"
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Users</MenuItem>
            <MenuItem value="admin">Admins</MenuItem>
            <MenuItem value="user">Regular Users</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell>Avatar</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <React.Fragment key={user._id}>
                <TableRow hover>
                  <TableCell>
                    <Avatar src={user.photo?.url || ''}>{user.name?.[0]}</Avatar>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.isBlocked ? <Block /> : <CheckCircle />}
                      label={user.isBlocked ? 'Blocked' : 'Active'}
                      color={user.isBlocked ? 'error' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedUser(expandedUser === user._id ? null : user._id)
                      }
                      title="View Details"
                    >
                      {expandedUser === user._id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
                      title="More Actions"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 0 }}>
                    <Collapse in={expandedUser === user._id} timeout="auto">
                      <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                              Contact Information
                            </Typography>
                            <Typography variant="body2">
                              <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phone:</strong> {user.phone || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Username:</strong> {user.username}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                              Account Details
                            </Typography>
                            <Typography variant="body2">
                              <strong>Role:</strong> {user.role}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Status:</strong>{' '}
                              {user.isBlocked ? (
                                <Chip label="Blocked" size="small" color="error" />
                              ) : (
                                <Chip label="Active" size="small" color="success" />
                              )}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Joined:</strong> {formatDate(user.createdAt)}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box display="flex" gap={2} mt={3}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<History />}
                            onClick={() => handleViewOrderHistory(user)}
                          >
                            View Orders
                          </Button>
                          {user.role === 'user' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => handleMenuOpen(e, user)}
                            >
                              Manage Roles
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VpnKey />}
                            onClick={() => {
                              setSelectedUser(user);
                              setPasswordDialogOpen(true);
                            }}
                          >
                            Reset Password
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
          count={users.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleUpdateRole('user')}>Make User</MenuItem>
        <MenuItem onClick={() => handleUpdateRole('admin')}>Make Admin</MenuItem>
        <Divider />
        <MenuItem onClick={handleToggleBlock}>
          {selectedUser?.isBlocked ? '✓ Unblock User' : '✗ Block User'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPasswordDialogOpen(true);
            handleMenuClose();
          }}
        >
          Reset Password
        </MenuItem>
        <MenuItem onClick={() => handleViewOrderHistory(selectedUser)}>
          View Order History
        </MenuItem>
      </Menu>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Reset Password for {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will set a new password for the user. Make sure to communicate the new password securely.
          </Alert>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={orderHistoryDialogOpen}
        onClose={() => setOrderHistoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order History for {selectedUser?.name}</DialogTitle>
        <DialogContent>
          {userOrders.length > 0 ? (
            userOrders.map((order) => (
              <Box
                key={order._id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Order #{order._id.slice(-8)}
                  </Typography>
                  <Chip label={order.status} size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(order.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Total:</strong> ${order.totalPrice.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Items:</strong> {order.orderItems.length}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No orders found</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;