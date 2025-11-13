import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import AdminNavigation from './AdminNavigation';

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', minHeight: '100vh' }}>
      {!isMobile && (
        <Box
          sx={{
            borderRight: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          <AdminNavigation />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {isMobile && <AdminNavigation />}
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
