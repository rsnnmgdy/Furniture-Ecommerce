import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Box,
  Rating,
  TextField,
  Button,
} from '@mui/material';

const ReviewForm = ({
  onSubmit,
  editingReview,
  onCancelEdit,
  initialRating = 5,
  initialText = '',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialText);

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment);
    } else {
      setRating(initialRating);
      setComment(initialText);
    }
  }, [editingReview, initialRating, initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <Paper
      id="review-form"
      elevation={0}
      variant="outlined"
      sx={{ p: 3, borderRadius: 2 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {editingReview ? 'Update Your Review' : 'Write a Review'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Your Rating:
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => {
                if (newValue) setRating(newValue);
              }}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              sx={{ alignSelf: 'flex-start', py: 1.5, px: 3 }}
            >
              {editingReview ? 'Update Review' : 'Submit Review'}
            </Button>
            {editingReview && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={onCancelEdit}
                sx={{ alignSelf: 'flex-start', py: 1.5, px: 3 }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ReviewForm;