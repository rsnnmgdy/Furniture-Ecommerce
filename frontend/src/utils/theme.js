import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // New Primary: Dark Wood/Espresso (for buttons, links, accents)
    primary: {
      main: '#6B5344', // Dark Espresso Brown
      light: '#A0825D', // Warm Beige Accent
      dark: '#403228',
      contrastText: '#fff',
    },
    // New Secondary: Black/Dark Grey (for backgrounds and text contrast)
    secondary: {
      main: '#1C1C1C', // Deep Black/Dark Grey
      light: '#333333',
      dark: '#000000',
      contrastText: '#fff',
    },
    background: {
      default: '#FAFAFA', // Light Beige/Off-White for main background
      paper: '#FFFFFF', // Pure White for cards/containers
    },
    text: {
      primary: '#1C1C1C', // Dark text
      secondary: '#666666', // Grey text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          // Use the new primary color for contained buttons
          '&.MuiButton-contained': {
              backgroundColor: '#6B5344',
          },
      },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

export default theme;