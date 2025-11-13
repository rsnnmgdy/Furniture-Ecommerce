import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ShoppingCartOutlined,
  PersonOutline,
  Menu as MenuIcon,
  DashboardOutlined,
  LogoutOutlined,
  ListAltOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'primary.dark',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontFamily: 'Georgia, serif', // More elegant font for a furniture store
            }}
          >
            FURNITURE
          </Typography>

          {/* Desktop Navigation Links (Optional but recommended) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 3 }}>
            <Button component={Link} to="/" color="inherit" sx={{ fontWeight: 500 }}>
              Home
            </Button>
            <Button component={Link} to="/products" color="inherit" sx={{ fontWeight: 500 }}>
              Shop All
            </Button>
            <Button component={Link} to="/categories/living-room" color="inherit" sx={{ fontWeight: 500 }}>
              Living Room
            </Button>
            <Button component={Link} to="/categories/bedroom" color="inherit" sx={{ fontWeight: 500 }}>
              Bedroom
            </Button>
          </Box>

          {/* Icons and Auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated() ? (
              <>
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ mr: 1 }}
                  aria-label="cart"
                >
                  <Badge badgeContent={getCartCount()} color="error">
                    <ShoppingCartOutlined />
                  </Badge>
                </IconButton>

                <IconButton onClick={handleMenuOpen} size="small" aria-label="account menu">
                  <Avatar
                    src={user?.photo?.url}
                    sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
                  >
                    {user?.name?.[0]}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Signed in as {user?.name}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleNavigate('/profile')}>
                    <ListItemIcon>
                      <PersonOutline fontSize="small" />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigate('/orders')}>
                    <ListItemIcon>
                      <ListAltOutlined fontSize="small" />
                    </ListItemIcon>
                    My Orders
                  </MenuItem>
                  {isAdmin() && (
                    <MenuItem onClick={() => handleNavigate('/admin/dashboard')}>
                      <ListItemIcon>
                        <DashboardOutlined fontSize="small" />
                      </ListItemIcon>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutOutlined fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ fontWeight: 500, textTransform: 'none', fontSize: '0.95rem' }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={() => {
                /* Implement mobile drawer toggle here */
              }}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;