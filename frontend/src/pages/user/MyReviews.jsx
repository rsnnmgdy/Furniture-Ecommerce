import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { RateReview, ArrowForward } from '@mui/icons-material';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import ReviewList from '../../components/user/ReviewList';
import Loading from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) { 
        fetchMyReviews();
    }
  }, [user]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      // This endpoint fetches only the logged-in user's reviews
      const response = await reviewService.getMyReviews(); 
      setReviews(response.reviews);
    } catch (error) {
      toast.error('Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };
  
  // FIX: Handles redirection when the user clicks 'Edit' on a review item
  const handleEdit = (review) => {
    // Redirects the user to the specific product's details page to view/edit the review form there
    toast.info("Redirecting to product page to manage review...");
    navigate(`/product/${review.product._id}`); 
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted');
      fetchMyReviews(); 
    } catch (error) {
      toast.error(error.message || 'Failed to delete review');
    }
  };


  if (loading) return <Loading />;

  if (reviews.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <RateReview sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          You haven't posted any reviews yet.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/products')} endIcon={<ArrowForward />}>
          Browse Products to Review
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" fontWeight={600} mb={3} color="secondary.main">
        My Reviews ({reviews.length})
      </Typography>
      
      {/* Renders the list of reviews using ReviewList and ReviewItem components */}
      <ReviewList 
          reviews={reviews}
          currentUserId={user?.id}
          isAdmin={user?.role === 'admin'}
          onDelete={handleDelete}
          onEdit={handleEdit} // Passes the redirection handler
      />
    </Box>
  );
};

export default MyReviews;