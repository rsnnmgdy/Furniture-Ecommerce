import React from 'react';
import {
  Paper,
  Stack,
  Avatar,
  Box,
  Typography,
  Rating,
  IconButton,
  Tooltip,
  Chip,
  Button,
} from '@mui/material';
import { DeleteOutline, EditOutlined, Visibility, WarningAmber } from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';

const ReviewItem = ({ review, currentUserId, isAdmin, onDelete, onEdit }) => {
  const canModify = currentUserId === review.user?._id || isAdmin;
  const isAuthor = currentUserId === review.user?._id;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 3, borderRadius: 2, position: 'relative' }}
    >
      
      {/* Action Stack (View, Edit, Delete) - FIX APPLIED HERE FOR VISIBILITY */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
      >
        {/* VIEW/EDIT BUTTON (Calls onEdit for redirection) */}
        <Button
            size="small"
            variant="outlined"
            onClick={() => onEdit(review)}
            startIcon={isAuthor ? <EditOutlined fontSize="small" /> : <Visibility fontSize="small" />}
        >
            {isAuthor ? 'Edit Review' : 'View Product'}
        </Button>
        
        {/* Delete Icon (Only for Author or Admin) */}
        {canModify && (
            <Tooltip title="Delete Review">
              <IconButton
                aria-label="delete review"
                size="small"
                onClick={() => onDelete(review._id)}
                sx={{ color: '#FF6B6B' }}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
        )}
      </Stack>

      {/* Reviewer Info */}
      <Stack direction="row" spacing={2} mb={2}>
        <Avatar src={review.user?.photo?.url || ''}>
          {review.user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {review.user?.name || 'Anonymous'}
          </Typography>
          <Rating value={review.rating} size="small" readOnly />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formatDate(review.createdAt)}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {review.comment}
      </Typography>
      {review.isFiltered && (
        <Chip
          icon={<WarningAmber fontSize="small" />}
          label="This comment has been filtered"
          size="small"
          color="warning"
          variant="outlined"
          sx={{ mt: 2, fontSize: '0.7rem' }}
        />
      )}
    </Paper>
  );
};

export default ReviewItem;