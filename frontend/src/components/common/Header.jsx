import React, { useState, useEffect } from 'react';
// 1. Import new hooks and components
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; 
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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  TextField, // For Search
  InputAdornment, // For Search
} from '@mui/material';
import {
  ShoppingCartOutlined,
  PersonOutline,
  Menu as MenuIcon,
  DashboardOutlined,
  LogoutOutlined,
  ListAltOutlined,
  ChevronRight,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ExpandLess,
  ExpandMore,
  Search as SearchIcon, // For Search
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null); 
  const [categoriesOpen, setCategoriesOpen] = useState(false); 
  const [mobileOpen, setMobileOpen] = useState(false); 
  
  // 2. Add state for the new search bar
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Sync search bar with URL (e.g., when pressing 'back')
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // 4. Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    } else {
      navigate('/products'); // Clear search if empty
    }
  };

  // --- (Your existing handlers) ---
  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };
  const handleCategoryMenuOpen = (event) => { setCategoryAnchorEl(event.currentTarget); };
  const handleCategoryMenuClose = () => { setCategoryAnchorEl(null); };
  const handleCategoriesClick = () => { setCategoriesOpen(!categoriesOpen); };
  const handleMobileMenuToggle = () => { setMobileOpen(!mobileOpen); };
  const handleMobileMenuClose = () => { setMobileOpen(false); };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    handleMobileMenuClose();
    handleCategoryMenuClose();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose(); 
    handleMobileMenuClose();
    handleCategoryMenuClose();
  };

  const categories = [
    { title: 'Living Room', path: '/categories/living-room' },
    { title: 'Bedroom', path: '/categories/bedroom' },
    { title: 'Kitchen', path: '/categories/kitchen' },
    { title: 'Outdoor', path: '/categories/outdoor' },
  ];

  const drawer = (
    <Box sx={{ width: 250, paddingTop: '1rem' }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1 }}>
        <IconButton onClick={handleMobileMenuClose}><ChevronRight /></IconButton>
      </Box>
      <Divider />
      {/* (You can add a mobile search bar here if you want) */}
      <List>
        <ListItemButton onClick={() => handleNavigate('/')}><ListItemText primary="Home" /></ListItemButton>
        <ListItemButton onClick={() => handleNavigate('/products')}><ListItemText primary="Products" /></ListItemButton>
        <ListItemButton onClick={handleCategoriesClick}>
          <ListItemText primary="Categories" />
          {categoriesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {categories.map((item) => (
              <ListItemButton key={item.title} sx={{ pl: 4 }} onClick={() => handleNavigate(item.path)}>
                <ListItemText primary={item.title} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <>
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
          <Toolbar disableGutters sx={{ minHeight: '70px', gap: 2 }}>
            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                display: { xs: 'none', md: 'flex' }, // Hide on small screens for space
                textDecoration: 'none',
                color: 'primary.dark',
                fontWeight: 700,
                letterSpacing: '0.5px',
                fontFamily: 'Georgia, serif',
              }}
            >
              FURNITURE
            </Typography>

            {/* 5. Add the Search Bar */}
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' },
                maxWidth: 400, // Limit width
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '50px', bgcolor: 'grey.100' }
                }}
              />
            </Box>
            
            {/* Mobile Logo (takes up space) */}
             <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                display: { xs: 'flex', md: 'none' }, // Show on small screens
                flexGrow: 1,
                textDecoration: 'none',
                color: 'primary.dark',
                fontWeight: 700,
              }}
            >
              FURNITURE
            </Typography>

            {/* Desktop Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button component={Link} to="/" color="inherit" sx={{ fontWeight: 500 }}>
                Home
              </Button>
              <Button component={Link} to="/products" color="inherit" sx={{ fontWeight: 500 }}>
                Products 
              </Button>
              <Button
                color="inherit"
                sx={{ fontWeight: 500 }}
                onClick={handleCategoryMenuOpen}
                endIcon={<KeyboardArrowDownIcon />}
              >
                Categories
              </Button>
            </Box>

            {/* Desktop Categories Dropdown Menu */}
            <Menu
              anchorEl={categoryAnchorEl}
              open={Boolean(categoryAnchorEl)}
              onClose={handleCategoryMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {categories.map((item) => (
                <MenuItem key={item.title} onClick={() => handleNavigate(item.path)}>
                  {item.title}
                </MenuItem>
              ))}
            </Menu>

            {/* Icons and Auth */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              {isAuthenticated() ? (
                <>
                  <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: 1 }} aria-label="cart">
                    <Badge badgeContent={getCartCount()} color="error">
                      <ShoppingCartOutlined />
                    </Badge>
                  </IconButton>
                  <IconButton onClick={handleMenuOpen} size="small" aria-label="account menu">
                    <Avatar src={user?.photo?.url} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
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
                        // ... (rest of your PaperProps)
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    {/* ... (Your menu items: Profile, Orders, etc.) ... */}
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Signed in as {user?.name}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleNavigate('/profile')}>
                      <ListItemIcon><PersonOutline fontSize="small" /></ListItemIcon>
                      My Profile
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/orders')}>
                      <ListItemIcon><ListAltOutlined fontSize="small" /></ListItemIcon>
                      My Orders
                    </MenuItem>
                    {isAdmin() && (
                      <MenuItem onClick={() => handleNavigate('/admin/dashboard')}>
                        <ListItemIcon><DashboardOutlined fontSize="small" /></ListItemIcon>
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login" sx={{ fontWeight: 500, textTransform: 'none', fontSize: '0.95rem' }}>
                    Login
                  </Button>
                  <Button variant="contained" component={Link} to="/register" sx={{ fontWeight: 500, textTransform: 'none', fontSize: '0.95rem', boxShadow: 'none' }}>
                    Sign Up
                  </Button>
                </>
              )}

              {/* Mobile Menu Icon */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleMobileMenuToggle} 
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* The Mobile Drawer Component */}
      <nav>
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleMobileMenuClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default Header;