import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment, 
  IconButton,     
  Stack,          
  CircularProgress, 
  Grid,
  Divider, // Added
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  PersonOutline, 
  LockOutlined, 
  Google,   // Added
  Facebook, // Added
} from '@mui/icons-material'; 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Added back the firebase social logins
import { signInWithGoogle, signInWithFacebook } from '../../config/firebase'; 

// Custom Yup validation for the client-side login form
const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  // Added firebaseLogin back
  const { login, firebaseLogin } = useAuth(); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hero image for the left side
  const loginImageUrl = "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=80";

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await login(values); 
        toast.success('Login successful!');
        navigate('/');
      } catch (err) {
        const serverMessage = err.data?.message || err.message || 'Login failed. Please check your credentials or network.';
        setError(serverMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  // --- ADDED BACK SOCIAL LOGIN HANDLERS ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await signInWithGoogle();
      await firebaseLogin(token); 
      toast.success('Welcome! Login successful!');
      navigate('/');
    } catch (err) {
      const socialError = err.message || 'Google login failed.';
      setError(socialError);
      toast.error(socialError);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await signInWithFacebook();
      await firebaseLogin(token);
      toast.success('Welcome! Login successful!');
      navigate('/');
    } catch (err) {
      const socialError = err.message || 'Facebook login failed.';
      setError(socialError);
      toast.error(socialError);
    } finally {
      setLoading(false);
    }
  };
  // --- END SOCIAL LOGIN HANDLERS ---


  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 70px)', 
        py: 8, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2A2A2A 50%, #FAF7F5 50%)', 
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={12} 
          sx={{ 
            p: 0,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Grid container>
            {/* Left Column: Image */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{
                display: { xs: 'none', md: 'block' },
                minHeight: '600px',
                backgroundImage: `url(${loginImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Right Column: Form */}
            <Grid 
              item 
              xs={12} 
              md={6} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: { xs: 3, sm: 5 }
              }}
            >
              <Box 
                sx={{ 
                  width: '100%', 
                  maxWidth: 400, 
                  bgcolor: '#FAF7F5', 
                  p: 4,
                  borderRadius: 4,
                }}
              >
                <Typography 
                  variant="h4" 
                  align="center" 
                  gutterBottom 
                  sx={{ fontWeight: 700, color: '#1C1C1C' }}
                >
                  Sign In
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    sx={{ mb: 2, bgcolor: 'white' }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    sx={{ mb: 3, bgcolor: 'white' }} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                      mb: 2, 
                      py: 1.5,
                      bgcolor: 'white',
                      color: '#1C1C1C',
                      border: '1px solid #ddd',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#f4f4f4',
                        boxShadow: 'none',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
                  </Button>
                  
                  {/* --- REDESIGNED SOCIAL LOGINS --- */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton
                      aria-label="login with google"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      sx={{ 
                        border: '1px solid #ddd', 
                        color: '#DB4437', // Google Red
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Google />
                    </IconButton>
                    <IconButton
                      aria-label="login with facebook"
                      onClick={handleFacebookLogin}
                      disabled={loading}
                      sx={{ 
                        border: '1px solid #ddd', 
                        color: '#1877F2', // Facebook Blue
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                    >
                      <Facebook />
                    </IconButton>
                  </Stack>
                  {/* --- END REDESIGN --- */}


                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Typography align="center" variant="body2">
                      <Link to="/forgot-password" style={{ color: '#1C1C1C', fontWeight: 500 }}>
                        Forgot password?
                      </Link>
                    </Typography>
                    <Typography align="center" variant="body2">
                      <Link to="/register" style={{ color: '#1C1C1C', fontWeight: 500 }}>
                        Register Here
                      </Link>
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;