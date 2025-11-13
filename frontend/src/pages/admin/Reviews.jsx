import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Rating,
  Grid,
} from '@mui/material';
import { Delete, Visibility, FilterList } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [filterProduct, setFilterProduct] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [filterRating, filterProduct]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRating > 0) params.append('rating', filterRating);
      if (filterProduct) params.append('product', filterProduct);

      const response = await api.get(`/admin/reviews?${params.toString()}`);
      setReviews(response.reviews || []);
    } catch {
      console.error('Failed to load reviews');
      // Fallback: try to fetch from general endpoint
      try {
        const response = await api.get('/reviews/all');
        setReviews(response.reviews || []);
      } catch {
        toast.error('Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=1000');
      setProducts(response.products || []);
    } catch {
      console.error('Failed to load products');
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/reviews/${selectedReview._id}`);
      toast.success('Review deleted successfully');
      setDeleteConfirmOpen(false);
      setSelectedReview(null);
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clearFilters = () => {
    setFilterRating(0);
    setFilterProduct('');
    setPage(0);
  };

  if (loading) return <Loading />;

  const paginatedReviews = reviews.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Reviews Management
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Rating</InputLabel>
            <Select
              value={filterRating}
              label="Filter by Rating"
              onChange={(e) => {
                setFilterRating(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value={0}>All Ratings</MenuItem>
              <MenuItem value={5}>⭐ 5 Stars</MenuItem>
              <MenuItem value={4}>⭐ 4 Stars</MenuItem>
              <MenuItem value={3}>⭐ 3 Stars</MenuItem>
              <MenuItem value={2}>⭐ 2 Stars</MenuItem>
              <MenuItem value={1}>⭐ 1 Star</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Product</InputLabel>
            <Select
              value={filterProduct}
              label="Filter by Product"
              onChange={(e) => {
                setFilterProduct(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Products</MenuItem>
              {products.map((product) => (
                <MenuItem key={product._id} value={product._id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(filterRating > 0 || filterProduct) && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Reviews Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{reviews.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Reviews
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {reviews.filter((r) => r.isFiltered).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtered (Bad Words)
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">
              {reviews.filter((r) => r.rating >= 4).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Positive (4-5 Stars)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell fontWeight={600}>Rating</TableCell>
              <TableCell fontWeight={600}>Product</TableCell>
              <TableCell fontWeight={600}>User</TableCell>
              <TableCell fontWeight={600}>Comment</TableCell>
              <TableCell fontWeight={600}>Status</TableCell>
              <TableCell fontWeight={600}>Date</TableCell>
              <TableCell fontWeight={600}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <TableRow key={review._id} hover>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {review.product?.name || review.productId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {review.user?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.user?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {review.comment}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {review.isFiltered && (
                        <Chip
                          label="Filtered"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={review.isApproved !== false ? 'Approved' : 'Pending'}
                        size="small"
                        color={review.isApproved !== false ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(review.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(review)}
                      title="View Details"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(review)}
                      title="Delete Review"
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No reviews found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={reviews.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>

      {/* Review Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 2 }}>
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Rating
                </Typography>
                <Rating value={selectedReview.rating} readOnly />
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Product
                </Typography>
                <Typography variant="body2">
                  {selectedReview.product?.name || 'N/A'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  User
                </Typography>
                <Typography variant="body2">
                  {selectedReview.user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedReview.user?.email}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Comment
                </Typography>
                <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  {selectedReview.comment}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Box display="flex" gap={1}>
                  {selectedReview.isFiltered && (
                    <Chip label="Bad Words Filtered" size="small" color="warning" />
                  )}
                  <Chip
                    label={selectedReview.isApproved !== false ? 'Approved' : 'Pending'}
                    size="small"
                    color={selectedReview.isApproved !== false ? 'success' : 'default'}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Date
                </Typography>
                <Typography variant="body2">{formatDate(selectedReview.createdAt)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Review?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
          {selectedReview && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Rating value={selectedReview.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedReview.comment}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReviews;
