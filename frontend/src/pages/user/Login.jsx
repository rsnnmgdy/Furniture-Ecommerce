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
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, firebaseLogin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setError(err.message || 'Invalid credentials');
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
      toast.success('Welcome! Login successful!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google login failed');
      toast.error('Google login failed. Please try again.');
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
      setError(err.message || 'Facebook login failed');
      toast.error('Facebook login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          Welcome Back
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          Login to your account
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
            Continue with Google
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
            Continue with Facebook
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Box display="flex" justifyContent="center" mb={2}>
            <Link to="/forgot-password" style={{ color: '#8B4513', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </Box>

          <Typography align="center" variant="body2">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#8B4513', fontWeight: 600 }}>
              Register here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
