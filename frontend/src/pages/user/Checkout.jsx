import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/helpers';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const validationSchema = Yup.object({
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string().required('ZIP code is required'),
  country: Yup.string().required('Country is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      paymentMethod: 'Credit Card',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        await handlePlaceOrder(values);
      }
    },
  });

  const handlePlaceOrder = async (values) => {
    try {
      setLoading(true);

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        paymentMethod: values.paymentMethod,
      };

      await orderService.createOrder(orderData);
      
      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={formik.handleSubmit}>
        {/* --- GRID V2 SYNTAX FIX --- */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Shipping Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        name="street"
                        value={formik.values.street}
                        onChange={formik.handleChange}
                        error={formik.touched.street && Boolean(formik.errors.street)}
                        helperText={formik.touched.street && formik.errors.street}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        error={formik.touched.city && Boolean(formik.errors.city)}
                        helperText={formik.touched.city && formik.errors.city}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={formik.values.state}
                        onChange={formik.handleChange}
                        error={formik.touched.state && Boolean(formik.errors.state)}
                        helperText={formik.touched.state && formik.errors.state}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="ZIP Code"
                        name="zipCode"
                        value={formik.values.zipCode}
                        onChange={formik.handleChange}
                        error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                        helperText={formik.touched.zipCode && formik.errors.zipCode}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={formik.values.country}
                        onChange={formik.handleChange}
                        error={formik.touched.country && Boolean(formik.errors.country)}
                        helperText={formik.touched.country && formik.errors.country}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Payment Method
                  </Typography>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select a method</FormLabel>
                    <RadioGroup
                      name="paymentMethod"
                      value={formik.values.paymentMethod}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel
                        value="Credit Card"
                        control={<Radio />}
                        label="Credit Card"
                      />
                      <FormControlLabel
                        value="PayPal"
                        control={<Radio />}
                        label="PayPal"
                      />
                      <FormControlLabel
                        value="Cash on Delivery"
                        control={<Radio />}
                        label="Cash on Delivery"
                      />
                    </RadioGroup>
                  </FormControl>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Note: This is a demo. No actual payment will be processed.
                  </Alert>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Review Your Order
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                      Shipping Address:
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.street}<br />
                      {formik.values.city}, {formik.values.state} {formik.values.zipCode}<br />
                      {formik.values.country}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                      Payment Method:
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.paymentMethod}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                    Order Items:
                  </Typography>
                  {cart.items.map((item) => (
                    <Box key={item._id} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        {item.product.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        {formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ flexGrow: 1 }}
                >
                  {activeStep === steps.length - 1
                    ? loading
                      ? 'Placing Order...'
                      : 'Place Order'
                    : 'Next'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Tax (8%):</Typography>
                <Typography>{formatCurrency(tax)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </Typography>
              </Box>

              {shipping > 0 && subtotal < 500 && (
                 <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                  Add {formatCurrency(500 - subtotal)} more for FREE shipping!
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  Total:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatCurrency(total)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Checkout;