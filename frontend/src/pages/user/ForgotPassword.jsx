import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await api.post('/auth/forgot-password', values);
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } catch (err) {
        toast.error(err.message || 'Failed to send reset link');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          Forgot Password
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          Enter your email to receive a password reset link
        </Typography>

        {emailSent ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset link sent! Check your email.
          </Alert>
        ) : (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Typography align="center" variant="body2">
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#8B4513', fontWeight: 600 }}>
                Login here
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
