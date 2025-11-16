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
  EmailOutlined,
  AccountCircleOutlined,
  Google,   // Added
  Facebook, // Added
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// Added back the firebase social logins
import { signInWithGoogle, signInWithFacebook } from '../../config/firebase'; 

const validationSchema = Yup.object({
  name: Yup.string().min(2, 'Min 2 characters').max(50, 'Max 50 characters').required('Name is required'),
  username: Yup.string().min(3, 'Min 3 characters').max(30, 'Max 30 characters').required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password'),
});

const Register = () => {
  const navigate = useNavigate();
  // Added firebaseLogin back
  const { register, firebaseLogin } = useAuth(); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hero image for the left side
  const registerImageUrl = "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1000&q=80";

  const formik = useFormik({
    initialValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        
        const userData = {
            name: values.name,
            email: values.email,
            username: values.username,
            password: values.password,
        };
        
        await register(userData);
        
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      } catch (err) {
        const serverMessage = err.data?.message || err.message || 'Registration failed. Please check your network.';
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
      toast.success('Welcome! Registration successful!');
      navigate('/');
    } catch (err) {
      const socialError = err.message || 'Google signup failed.';
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
      toast.success('Welcome! Registration successful!');
      navigate('/');
    } catch (err) {
      const socialError = err.message || 'Facebook signup failed.';
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
                backgroundImage: `url(${registerImageUrl})`,
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
                  Create Account
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    sx={{ mb: 2, bgcolor: 'white' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />

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
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    sx={{ mb: 2, bgcolor: 'white' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined />
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
                    sx={{ mb: 2, bgcolor: 'white' }}
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

                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                    {loading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
                  </Button>

                  {/* --- REDESIGNED SOCIAL LOGINS --- */}
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton
                      aria-label="register with google"
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
                      aria-label="register with facebook"
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

                  <Typography align="center" variant="body2" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#1C1C1C', fontWeight: 600 }}>
                      Login here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;