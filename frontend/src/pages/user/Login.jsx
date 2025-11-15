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
  Stack,          
  CircularProgress, 
} from '@mui/material';
import { Google, Facebook, Visibility, VisibilityOff } from '@mui/icons-material'; 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle, signInWithFacebook } from '../../config/firebase'; 

// Custom Yup validation for the client-side login form
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
        // FIX APPLIED: Prioritize the specific message sent by the backend (err.data?.message)
        const serverMessage = err.data?.message || err.message || 'Login failed. Please check your credentials or network.';
        setError(serverMessage);
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

          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ textTransform: 'none', py: 1.25 }}
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
                textTransform: 'none', 
                py: 1.25,
                color: '#1877F2',
                borderColor: '#1877F2'
              }}
            >
              Continue with Facebook
            </Button>
          </Stack>

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
              sx={{ 
                mb: 2, 
                py: 1.5,
                bgcolor: '#8B4513', 
                '&:hover': {
                  bgcolor: '#a05a2c'
                }
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
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
    </Box>
  );
};

export default Login;