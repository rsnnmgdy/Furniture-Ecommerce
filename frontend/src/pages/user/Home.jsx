import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Drawer,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Badge,
  Stack,
  Divider,
  InputAdornment,
  Collapse,
  IconButton,
  Fab,
} from '@mui/material';
import {
  FilterList,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Close,
  Search,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const categories = [
  'All',
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Outdoor',
  'Storage',
  'Decor',
  'Kitchen',
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addToCart, getCartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollMode, setScrollMode] = useState('infinite');
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    price: true,
    rating: true,
  });
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '-createdAt',
  });

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(true);
  }, [filters, scrollMode, searchQuery]);

  const fetchProducts = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit: 10,
        sort: filters.sort,
      };

      if (filters.category !== 'All') params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (searchQuery) params.search = searchQuery;

      const response = await productService.getProducts(params);

      if (scrollMode === 'infinite') {
        setProducts((prev) =>
          reset ? response.products : [...prev, ...response.products]
        );
        setHasMore(currentPage < response.totalPages);
      } else {
        setProducts(response.products);
      }
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 1 && scrollMode === 'infinite') {
      fetchProducts();
    }
  }, [page]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated()) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const FilterPanel = () => (
    <Box>
      {/* Category Filter */}
      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, category: !expandedFilters.category })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: '#333',
            fontWeight: 700,
            fontSize: '0.95rem',
            pl: 0,
            pr: 1,
          }}
        >
          Category
          {expandedFilters.category ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expandedFilters.category}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              sx={{ fontSize: '0.9rem' }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      {/* Price Filter */}
      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, price: !expandedFilters.price })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: '#333',
            fontWeight: 700,
            fontSize: '0.95rem',
            pl: 0,
            pr: 1,
          }}
        >
          Price Range
          {expandedFilters.price ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expandedFilters.price}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Min Price"
              type="number"
              size="small"
              fullWidth
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.9rem' } }}
            />
            <TextField
              label="Max Price"
              type="number"
              size="small"
              fullWidth
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.9rem' } }}
            />
          </Stack>
        </Collapse>
      </Box>

      {/* Rating Filter */}
      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, rating: !expandedFilters.rating })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: '#333',
            fontWeight: 700,
            fontSize: '0.95rem',
            pl: 0,
            pr: 1,
          }}
        >
          Rating
          {expandedFilters.rating ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expandedFilters.rating}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value="4">⭐ 4+ Stars</MenuItem>
              <MenuItem value="3">⭐ 3+ Stars</MenuItem>
              <MenuItem value="2">⭐ 2+ Stars</MenuItem>
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      {/* Sort By */}
      <Box mb={3}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value="-createdAt">Newest First</MenuItem>
            <MenuItem value="price">Price: Low to High</MenuItem>
            <MenuItem value="-price">Price: High to Low</MenuItem>
            <MenuItem value="-averageRating">Highest Rated</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Clear Filters */}
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          setFilters({
            category: 'All',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            sort: '-createdAt',
          });
          setPage(1);
        }}
        sx={{
          textTransform: 'uppercase',
          fontWeight: 600,
          fontSize: '0.85rem',
          letterSpacing: '0.3px',
        }}
      >
        Clear All
      </Button>
    </Box>
  );

  const ProductCard = ({ product }) => {
    const isWishlisted = wishlist.includes(product._id);
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        {/* Image Container */}
        <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
          {hasDiscount && (
            <Chip
              label={`-${discountPercent}%`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontWeight: 700,
                zIndex: 2,
              }}
            />
          )}
          <CardMedia
            component="img"
            image={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
            alt={product.name}
            onClick={() => navigate(`/product/${product._id}`)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              p: 1,
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />

          {/* Wishlist Button */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product._id);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'white',
              borderRadius: '50%',
              p: 0.75,
              display: 'flex',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isWishlisted ? (
              <Favorite sx={{ color: 'red', fontSize: '1.2rem' }} />
            ) : (
              <FavoriteBorder sx={{ color: '#666', fontSize: '1.2rem' }} />
            )}
          </Box>
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Chip
            label={product.category}
            size="small"
            sx={{ mb: 1, fontSize: '0.7rem', height: 20 }}
          />
          <Typography
            variant="h6"
            onClick={() => navigate(`/product/${product._id}`)}
            sx={{
              fontWeight: 500,
              fontSize: '0.9rem',
              lineHeight: 1.4,
              minHeight: 40,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              mb: 1,
              color: '#333',
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
            <Rating value={product.averageRating || 0} precision={0.5} size="small" readOnly />
            <Typography variant="caption" color="text.secondary">
              ({product.numReviews || 0})
            </Typography>
          </Stack>

          {/* Price */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              ${hasDiscount ? product.salePrice.toFixed(2) : product.price.toFixed(2)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                ${product.price.toFixed(2)}
              </Typography>
            )}
          </Stack>
        </CardContent>

        {/* Action Button */}
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handleAddToCart(product._id)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              py: 0.8,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              borderRadius: '2px',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>
    );
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <Box>
      {/* Floating Shopping Cart Button */}
      <Fab
        color="primary"
        onClick={() => navigate('/cart')}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          backgroundColor: 'rgba(211, 47, 47, 0.9)',
          color: 'white',
          width: 60,
          height: 60,
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
          '&:hover': {
            backgroundColor: 'rgba(183, 28, 28, 0.95)',
            boxShadow: '0 6px 16px rgba(211, 47, 47, 0.6)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Badge badgeContent={getCartCount()} color="error">
          <ShoppingCart sx={{ fontSize: '1.8rem' }} />
        </Badge>
      </Fab>

      {/* Premium Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
          color: 'white',
          py: 8,
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Premium Furniture Collection
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Discover exquisitely crafted furniture pieces that transform your living spaces.
            Quality, style, and comfort in every design.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {['Free Shipping', 'Quality Guaranteed', '30-Day Returns'].map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Search & Filter Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#fafafa' }}>
          <Stack spacing={2}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', md: 600 },
                mx: 'auto',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(211, 47, 47, 0.1)',
                  },
                },
              }}
            />

            {/* Filter Controls */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {products.length} products
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                {!isMobile && (
                  <Button
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                    sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Filters
                  </Button>
                )}

                <ToggleButtonGroup
                  value={scrollMode}
                  exclusive
                  onChange={(e, value) => value && setScrollMode(value)}
                  size="small"
                  sx={{
                    backgroundColor: '#f5f5f5',
                    '& .MuiToggleButton-root': {
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      px: 2,
                      border: 'none',
                    },
                    '& .MuiToggleButton-root.Mui-selected': {
                      backgroundColor: '#333',
                      color: 'white',
                    },
                  }}
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="infinite">Scroll</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Filter Sidebar */}
          {!isMobile && showFilters && (
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 20 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Filters
                  </Typography>
                  <IconButton size="small" onClick={() => setShowFilters(false)}>
                    <Close />
                  </IconButton>
                </Stack>
                <FilterPanel />
              </Paper>
            </Grid>
          )}

          {/* Mobile Filter Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '85%',
                maxWidth: 300,
                backgroundColor: '#fafafa',
                p: 2,
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filters
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Stack>
            <FilterPanel />
          </Drawer>

          {/* Products Grid */}
          <Grid item xs={12} md={showFilters && !isMobile ? 9 : 12}>
            {isMobile && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setDrawerOpen(true)}
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Show Filters
              </Button>
            )}

            {products.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" mb={2}>
                  No products found
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({
                      category: 'All',
                      minPrice: '',
                      maxPrice: '',
                      minRating: '',
                      sort: '-createdAt',
                    });
                    setPage(1);
                  }}
                  sx={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Reset Filters
                </Button>
              </Box>
            ) : scrollMode === 'infinite' ? (
              <InfiniteScroll
                dataLength={products.length}
                next={loadMore}
                hasMore={hasMore}
                loader={<Loading />}
                endMessage={
                  <Typography textAlign="center" py={3} color="text.secondary">
                    No more products to load
                  </Typography>
                }
              >
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              </InfiniteScroll>
            ) : (
              <>
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <Stack direction="row" justifyContent="center" spacing={1} mt={4}>
                    <Button
                      variant="outlined"
                      disabled={page === 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'contained' : 'outlined'}
                        onClick={() => setPage(pageNum)}
                        sx={{ minWidth: 40 }}
                      >
                        {pageNum}
                      </Button>
                    ))}
                    <Button
                      variant="outlined"
                      disabled={page === totalPages}
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                    >
                      Next
                    </Button>
                  </Stack>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
