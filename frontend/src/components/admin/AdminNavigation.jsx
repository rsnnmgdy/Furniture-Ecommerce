import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  ShoppingBag,
  ShoppingCart,
  People,
  Reviews,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { label: 'Products', icon: <ShoppingBag />, path: '/admin/products' },
    { label: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { label: 'Reviews', icon: <Reviews />, path: '/admin/reviews' },
    { label: 'Users', icon: <People />, path: '/admin/users' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const DrawerContent = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, bgcolor: '#8B4513', color: 'white' }}>
        <Typography variant="h6" fontWeight={700}>
          Admin Panel
        </Typography>
        <Typography variant="caption">Management Dashboard</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                bgcolor: isActive(item.path) ? 'rgba(139, 69, 19, 0.1)' : 'transparent',
                borderLeft: isActive(item.path) ? '4px solid #8B4513' : '4px solid transparent',
                '&.Mui-selected': {
                  bgcolor: 'rgba(139, 69, 19, 0.1)',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'rgba(139, 69, 19, 0.15)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? '#8B4513' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: isActive(item.path) ? 600 : 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
          {DrawerContent}
        </Drawer>
      </>
    );
  }

  // For desktop, just return the content. 
  // The AdminLayout component will handle placing it in the sidebar.
  return DrawerContent;
};

export default AdminNavigation;