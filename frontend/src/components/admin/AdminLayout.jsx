import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import AdminNavigation from './AdminNavigation';

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', 
      height: '100%' // Fill the parent container from App.jsx
    }}>
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            borderRight: '1px solid #e0e0e0',
            position: 'sticky', // Stick to the top
            top: 0, 
            // FIX: Set height to 100vh minus the 70px header
            height: 'calc(100vh - 70px)', 
            overflowY: 'auto',
            // FIX: Add white background to match screenshot
            bgcolor: 'background.paper', 
          }}
        >
          <AdminNavigation />
        </Box>
      )}

      {/* Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        {/* Mobile Navigation */}
        {isMobile && (
          <Box sx={{ 
            borderBottom: '1px solid #e0e0e0', 
            bgcolor: 'background.paper',
            display: 'flex', // Added to contain the IconButton
            alignItems: 'center',
            p: 1, // Added padding for mobile nav
          }}>
             <AdminNavigation />
          </Box>
        )}
        
        {/* Page Content (e.g., Products.jsx) */}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;