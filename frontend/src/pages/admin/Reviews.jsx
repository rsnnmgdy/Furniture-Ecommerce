import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Delete,
  Info,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const PRIMARY_GRADIENT = 'linear-gradient(135deg, #C67C4E 0%, #8B6F47 100%)';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ratingFilter, setRatingFilter] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (ratingFilter) params.append('rating', ratingFilter);
      const response = await api.get(`/admin/reviews?${params.toString()}&limit=100`);
      setReviews(response.reviews || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/reviews/${selectedReview._id}`);
      toast.success('Review deleted successfully');
      setDeleteDialogOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleOpenDetails = (review) => {
    setSelectedReview(review);
    setDetailsDialogOpen(true);
  };

  if (loading) return <Loading />;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const paginatedReviews = reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} sx={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Reviews
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Manage customer reviews and ratings
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{reviews.length}</Typography>
              <Typography variant="caption" color="textSecondary">Total Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                <Typography variant="h6" fontWeight={700}>{avgRating}</Typography>
                <Rating value={parseFloat(avgRating)} readOnly size="small" precision={0.1} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>Average Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{ratingDistribution[5]}</Typography>
              <Typography variant="caption" color="textSecondary">5-Star Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" fontWeight={700}>{ratingDistribution[1]}</Typography>
              <Typography variant="caption" color="textSecondary">1-Star Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #E8E8E8' }}>
        <CardContent sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Rating</InputLabel>
            <Select value={ratingFilter} label="Filter by Rating" onChange={(e) => { setRatingFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All Reviews</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4 Stars</MenuItem>
              <MenuItem value="3">3 Stars</MenuItem>
              <MenuItem value="2">2 Stars</MenuItem>
              <MenuItem value="1">1 Star</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Reviewer</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Review Text</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReviews.map((review) => (
                <TableRow key={review._id} sx={{ '&:hover': { backgroundColor: '#FAFAFA' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#2C2C2C' }}>
                      {review.product?.name || 'Unknown Product'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32, background: PRIMARY_GRADIENT, fontSize: '14px' }}>
                        {review.user?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{review.user?.name}</Typography>
                        <Typography variant="caption" color="textSecondary">{review.user?.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#C67C4E' }}>
                        {review.rating}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666' }}>
                      {review.comment || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', color: '#666' }}>{formatDate(review.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetails(review)}
                        sx={{ color: '#8B6F47' }}
                        title="View details"
                      >
                        <Info fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => { setSelectedReview(review); setDeleteDialogOpen(true); }}
                        sx={{ color: '#FF6B6B' }}
                        title="Delete review"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={reviews.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} sx={{ borderTop: '1px solid #EFEFEF', backgroundColor: '#FAFAFA' }} />
      </Card>

      {/* Review Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700 }}>
          Review Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Product</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                {selectedReview.product?.name}
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Reviewer</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                {selectedReview.user?.name} ({selectedReview.user?.email})
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Rating</Typography>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Rating value={selectedReview.rating} readOnly />
                <Typography variant="body2" fontWeight={700}>{selectedReview.rating}/5</Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Review</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666', whiteSpace: 'pre-wrap' }}>
                {selectedReview.comment || 'No comment provided'}
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Date</Typography>
              <Typography variant="body2" color="textSecondary">
                {formatDate(selectedReview.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700 }}>
          Delete Review
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ background: '#FF6B6B' }} onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reviews;
