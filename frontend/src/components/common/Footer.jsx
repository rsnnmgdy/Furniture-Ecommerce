import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Facebook, Instagram, Twitter } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              About Us
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Quality furniture for your home. We provide elegant and comfortable
              furniture pieces that transform your living spaces.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/products" color="inherit" underline="hover">
                Products
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                About
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            © {new Date().getFullYear()} Furniture Store. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const IconButton = ({ children, ...props }) => (
  <Box
    component="a"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.1)',
      transition: 'all 0.3s',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: 'rgba(255,255,255,0.2)',
        transform: 'translateY(-2px)',
      },
    }}
    {...props}
  >
    {children}
  </Box>
);

export default Footer;
