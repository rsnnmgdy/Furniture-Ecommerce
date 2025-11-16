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
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  Block,
  CheckCircle,
  Shield,
  VpnKey,
  Delete, // NEW
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const PRIMARY_GRADIENT = 'linear-gradient(135deg, #C67C4E 0%, #8B6F47 100%)';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
      toast.success(newStatus ? 'User blocked' : 'User unblocked');
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
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
  
  // NEW FUNCTION: Handle User Deletion
  const handleDeleteUser = async () => {
      if (!window.confirm(`Are you sure you want to permanently delete user ${selectedUser.username}? This action cannot be undone.`)) {
          return;
      }
      try {
          await api.delete(`/admin/users/${selectedUser._id}`);
          toast.success('User deleted successfully');
          handleMenuClose();
          fetchUsers();
      } catch (error) {
          toast.error(error.message || 'Failed to delete user');
      }
  };


  if (loading) return <Loading />;

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} sx={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Users
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Manage user accounts and permissions
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{users.length}</Typography>
              <Typography variant="caption" color="textSecondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{users.filter(u => u.role === 'admin').length}</Typography>
              <Typography variant="caption" color="textSecondary">Admins</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{users.filter(u => u.isBlocked).length}</Typography>
              <Typography variant="caption" color="textSecondary">Blocked</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{users.filter(u => u.role === 'user').length}</Typography>
              <Typography variant="caption" color="textSecondary">Regular Users</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #E8E8E8' }}>
        <CardContent sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select value={roleFilter} label="Filter by Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Users</MenuItem>
              <MenuItem value="admin">Admins</MenuItem>
              <MenuItem value="user">Regular Users</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: '#FAFAFA' } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar src={user.photo?.url || ''} sx={{ width: 40, height: 40 }}>
                        {user.name?.[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px' }}>{user.email}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{ background: user.role === 'admin' ? 'linear-gradient(135deg, #FF6B6B20, #FF6B6B10)' : 'linear-gradient(135deg, #C67C4E20, #C67C4E10)', color: user.role === 'admin' ? '#FF6B6B' : '#C67C4E', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.isBlocked ? <Block /> : <CheckCircle />}
                      label={user.isBlocked ? 'Blocked' : 'Active'}
                      size="small"
                      sx={{ background: user.isBlocked ? 'linear-gradient(135deg, #FF6B6B20, #FF6B6B10)' : 'linear-gradient(135deg, #4CAF5020, #4CAF5010)', color: user.isBlocked ? '#FF6B6B' : '#4CAF50', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#666' }}>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)} sx={{ color: '#8B6F47' }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={users.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} sx={{ borderTop: '1px solid #EFEFEF', backgroundColor: '#FAFAFA' }} />
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleUpdateRole('admin'); }}>
          <Shield sx={{ mr: 1, fontSize: 18 }} /> Make Admin
        </MenuItem>
        <MenuItem onClick={() => { handleUpdateRole('user'); }}>
          <Shield sx={{ mr: 1, fontSize: 18 }} /> Make User
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setPasswordDialogOpen(true); handleMenuClose(); }}>
          <VpnKey sx={{ mr: 1, fontSize: 18 }} /> Reset Password
        </MenuItem>
        <MenuItem onClick={handleToggleBlock}>
          <Block sx={{ mr: 1, fontSize: 18 }} /> {selectedUser?.isBlocked ? 'Unblock' : 'Block'} User
        </MenuItem>
        <Divider />
        {/* NEW MENU ITEM */}
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} /> Delete User
        </MenuItem>
      </Menu>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700 }}>
          Reset Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ background: PRIMARY_GRADIENT }} onClick={handleResetPassword}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;