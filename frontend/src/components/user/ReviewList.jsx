import React from 'react';
import { Stack, Typography } from '@mui/material';
import ReviewItem from './ReviewItem';

const ReviewList = ({ reviews, currentUserId, isAdmin, onDelete, onEdit }) => {
  if (reviews.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
        No reviews yet. Be the first to review!
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </Stack>
  );
};

export default ReviewList;