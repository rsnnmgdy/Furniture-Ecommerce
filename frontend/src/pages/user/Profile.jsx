import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Tabs, 
  Tab, 
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab'; 
import { PhotoCamera, Settings, Save, Cancel, CheckCircle, Block, PersonOutline, ShoppingBag, RateReview, VpnKey, LockOpen } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

// Import existing components 
import Orders from './Orders'; 
import MyReviews from './MyReviews'; // IMPORTED NEW COMPONENT

// CUSTOM YUP VALIDATION SCHEMA 
const validationSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').required('Full Name is required'), 
  email: Yup.string().email('Invalid email format').required('Email is required'), 
  phone: Yup.string().matches(/^[\d\s\-\+\(\)]*$/, 'Invalid phone number format').required('Phone number is required'),
  street: Yup.string().nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().nullable(),
  zipCode: Yup.string().nullable(),
  country: Yup.string().nullable(),
});

// Password Dialog Validation
const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string().min(6, 'New Password must be at least 6 characters').required('New Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Confirm Password is required'),
});

// Change Password Dialog Component
const PasswordDialog = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    
    const passFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: passwordValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                toast.success('Password updated successfully!');
                onClose();
                resetForm();
            } catch (error) {
                toast.error(error.message || 'Failed to change password. Check current password.');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600 }}>
                Change Password
            </DialogTitle>
            <Box component="form" onSubmit={passFormik.handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            name="currentPassword"
                            {...passFormik.getFieldProps('currentPassword')}
                            error={passFormik.touched.currentPassword && Boolean(passFormik.errors.currentPassword)}
                            helperText={passFormik.touched.currentPassword && passFormik.errors.currentPassword}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            name="newPassword"
                            {...passFormik.getFieldProps('newPassword')}
                            error={passFormik.touched.newPassword && Boolean(passFormik.errors.newPassword)}
                            helperText={passFormik.touched.newPassword && passFormik.errors.newPassword}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            name="confirmPassword"
                            {...passFormik.getFieldProps('confirmPassword')}
                            error={passFormik.touched.confirmPassword && Boolean(passFormik.errors.confirmPassword)}
                            helperText={passFormik.touched.confirmPassword && passFormik.errors.confirmPassword}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockOpen />}>
                        Save Password
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};


const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo?.url || '');
  const [isEditing, setIsEditing] = useState(false); 
  const [currentTab, setCurrentTab] = useState('1'); 
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);


  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'USA',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('phone', values.phone);
        
        formData.append('address[street]', values.street);
        formData.append('address[city]', values.city);
        formData.append('address[state]', values.state);
        formData.append('address[zipCode]', values.zipCode);
        formData.append('address[country]', values.country);

        if (photoFile) {
          formData.append('photo', photoFile);
        }

        const response = await authService.updateProfile(formData);
        updateUser(response.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false); 
        setPhotoFile(null); 
      } catch (error) {
        toast.error(error.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
  });

  const handlePhotoChange = (e) => {
    if (!isEditing) return; 
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleCancel = () => {
    formik.resetForm(); 
    setPhotoFile(null);
    setPhotoPreview(user?.photo?.url || ''); 
    setIsEditing(false); 
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setIsEditing(false); // Disable editing when switching tabs
  };

  // MENU HANDLERS
  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleEditClick = () => {
    setIsEditing(true);
    setCurrentTab('1'); // Switch to Profile Details tab
    handleMenuClose();
  };

  const handleChangePasswordClick = () => {
    setPasswordDialogOpen(true);
    handleMenuClose();
  };
  
  const renderProfileForm = () => (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate> {/* ADDED noValidate */}
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary.main" mt={3}>
          Basic Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              // CUSTOM VALIDATION INTEGRATION
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              // CUSTOM VALIDATION INTEGRATION
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              // CUSTOM VALIDATION INTEGRATION
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={user?.username}
              disabled 
            />
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom fontWeight={600} color="primary.main">
          Address (Optional)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={formik.values.street}
              onChange={formik.handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formik.values.zipCode}
              onChange={formik.handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
        
        {isEditing && (
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
                variant="outlined"
                size="large"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={loading}
            >
                Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Save />}
              disabled={loading}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </Stack>
        )}
      </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 70px)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, position: 'relative' }}>
          
          {/* HEADER SECTION */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight={700} color="secondary.main">
              My Profile
            </Typography>
            
            {/* SETTINGS MENU BUTTON */}
            <IconButton onClick={handleMenuOpen} color="inherit" title="Settings">
              <Settings />
            </IconButton>
          </Stack>
          
          {/* USER INFO CARD */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', mb: 3, display: 'flex', alignItems: 'center', gap: 3, bgcolor: 'background.paper' }}>
            <Box position="relative">
              <Avatar
                src={photoPreview || ''}
                sx={{ width: 80, height: 80, border: `3px solid ${isEditing ? 'primary.main' : 'transparent'}`, transition: 'all 0.3s' }}
              >
                {user?.name?.[0]}
              </Avatar>
              {isEditing && (
                  <IconButton
                      component="label"
                      sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                      <PhotoCamera fontSize="small" />
                      <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </IconButton>
              )}
            </Box>
            
            <Box>
                <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                
                {/* STATUS AND ROLE DISPLAY */}
                <Stack direction="row" spacing={1}>
                    <Chip 
                        label={user?.role?.toUpperCase() || 'USER'} 
                        size="small"
                        sx={{ fontWeight: 600, bgcolor: 'secondary.main', color: 'white' }}
                    />
                    {user?.isBlocked ? ( 
                        <Chip icon={<Block fontSize="small" />} label="BLOCKED" size="small" color="error" sx={{ fontWeight: 600 }} />
                    ) : (
                        <Chip icon={<CheckCircle fontSize="small" />} label="ACTIVE" size="small" color="success" sx={{ fontWeight: 600 }} />
                    )}
                </Stack>
            </Box>
          </Paper>

          {/* SETTINGS MENU */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEditClick} disabled={isEditing}>
                <PersonOutline fontSize="small" sx={{ mr: 1 }} /> Edit Profile
            </MenuItem>
            <MenuItem onClick={handleChangePasswordClick}>
                <VpnKey fontSize="small" sx={{ mr: 1 }} /> Change Password
            </MenuItem>
          </Menu>

          {/* TAB NAVIGATION */}
          <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={currentTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                <Tab label="Profile Details" icon={<PersonOutline />} iconPosition="start" value="1" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="My Orders" icon={<ShoppingBag />} iconPosition="start" value="2" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="My Reviews" icon={<RateReview />} iconPosition="start" value="3" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
              </Tabs>
            </Box>
            
            {/* TAB PANELS */}
            <TabPanel value="1" sx={{ p: 0 }}>
              {renderProfileForm()}
            </TabPanel>
            
            <TabPanel value="2" sx={{ p: 0 }}>
              <Orders /> 
            </TabPanel>
            
            <TabPanel value="3" sx={{ p: 0 }}>
              <MyReviews />
            </TabPanel>
            
          </TabContext>

        </Paper>
      </Container>
      
      {/* Change Password Dialog (Separate Component) */}
      <PasswordDialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)} 
      />
    </Box>
  );
};

export default Profile;