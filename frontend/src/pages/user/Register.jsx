import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Google, Facebook, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
// FIX: Import the necessary Firebase functions for social login
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
  // We need firebaseLogin from context to handle social login tokens
  const { register, firebaseLogin, user } = useAuth(); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // This useEffect redirects on successful social login
  useEffect(() => {
    if (user) {
      toast.success('Welcome! Registration successful!');
      navigate('/');
    }
  }, [user, navigate]);

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
        
        // FIX APPLIED: Pass a single userData object containing the necessary fields
        const userData = {
            name: values.name,
            email: values.email,
            username: values.username,
            password: values.password,
        };
        
        await register(userData);
        
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } catch (err) {
        setError(err.message || err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await signInWithGoogle();
      await firebaseLogin(token); 
    } catch (err) {
      setError(err.message || 'Google signup failed');
      toast.error('Google signup failed. Please try again.');
      setLoading(false);
    }
  };

  // --- Facebook Login Handler ---
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await signInWithFacebook();
      await firebaseLogin(token);
    } catch (err) {
      setError(err.message || 'Facebook signup failed');
      toast.error('Facebook signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f7f4f1', minHeight: 'calc(100vh - 70px)', py: 8 }}>
      <Container maxWidth="xs">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 2, 
            border: '1px solid #e0e0e0' 
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom 
            sx={{ fontWeight: 700, color: '#6a4f4b' }}
          >
            Create Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={3}>
            Sign up to get started
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* === Social Login Buttons === */}
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ textTransform: 'none', py: 1.25 }}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Facebook />}
              onClick={handleFacebookLogin}
              disabled={loading}
              sx={{ 
                textTransform: 'none', 
                py: 1.25,
                color: '#1877F2',
                borderColor: '#1877F2'
              }}
            >
              Sign up with Facebook
            </Button>
          </Stack>
          {/* === END Social Login Buttons === */}

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
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
              InputProps={{
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
              sx={{ mb: 2 }}
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
              InputProps={{
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
              sx={{ mb: 3 }}
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
                bgcolor: '#8B4513',
                '&:hover': {
                  bgcolor: '#a05a2c'
                }
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
            </Button>

            <Typography align="center" variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#8B4513', fontWeight: 600 }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;