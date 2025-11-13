import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  // A high-quality, aesthetic furniture image URL
  const heroImageUrl =
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1920&q=80';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: { xs: '60vh', md: '75vh' },
        minHeight: 400,
        color: 'white',
        textAlign: 'center',
        // Set the background image
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2,
        },
        // Add a dark overlay for text readability
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.5px',
            mb: 3,
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          Timeless Design, Modern Comfort
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{
            maxWidth: '700px',
            mx: 'auto',
            mb: 4,
            opacity: 0.95,
            fontWeight: 300,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
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
            bgcolor: 'white',
            color: 'primary.dark',
            fontSize: '1rem',
            fontWeight: 600,
            px: 5,
            py: 1.5,
            '&:hover': {
              bgcolor: 'background.paper',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Shop The Collection
        </Button>
      </Container>
    </Box>
  );
};

export default Hero;