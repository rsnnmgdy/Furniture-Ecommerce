import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  // New Hero Image
  const heroImageUrl =
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align content to the left
        height: { xs: '70vh', md: '85vh' },
        minHeight: 500,
        color: 'text.primary',
        bgcolor: '#f5f5f5', // Light beige background
        // Set the background image
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '40%', // Start image from 40% of the screen
          right: 0,
          bottom: 0,
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, textAlign: 'left', p: 4 }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '45%' } }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              mb: 3,
              color: '#1C1C1C', // Dark text
            }}
          >
            Elegant Furniture
            <br />
            For Your Home
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              maxWidth: '500px',
              mb: 4,
              opacity: 0.8,
              fontWeight: 300,
              color: 'text.secondary',
            }}
          >
            Discover exquisitely crafted furniture that transforms your living
            spaces. Quality, style, and comfort in every design.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              // Smooth scroll to the products grid
              document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              px: 5,
              py: 1.5,
              borderRadius: '50px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Shop The Collection
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;