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
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Google, Facebook, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
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
  const { register, firebaseLogin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        await register(values);
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { token } = await signInWithGoogle();
      await firebaseLogin(token);
      toast.success('Welcome! Registration successful!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google signup failed');
      toast.error('Google signup failed. Please try again.');
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
      setError(err.message || 'Facebook signup failed');
      toast.error('Facebook signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
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

        <Box sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ 
              mb: 1.5,
              borderColor: '#DB4437',
              color: '#DB4437',
              '&:hover': {
                borderColor: '#C33D2E',
                bgcolor: 'rgba(219, 68, 55, 0.04)'
              }
            }}
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
              borderColor: '#4267B2',
              color: '#4267B2',
              '&:hover': {
                borderColor: '#365899',
                bgcolor: 'rgba(66, 103, 178, 0.04)'
              }
            }}
          >
            Sign up with Facebook
          </Button>
        </Box>

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
            sx={{ mb: 2 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
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
  );
};

export default Register;
