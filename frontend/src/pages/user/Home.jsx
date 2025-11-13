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
import Hero from '../../components/user/Hero';
import useDebounce from '../../utils/useDebounce';

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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(true);
  }, [filters, scrollMode, debouncedSearchQuery]);

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
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;

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

  // Filter Panel Component (to be used in Drawer and Sidebar)
  const FilterPanel = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      {isMobile && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Stack>
      )}
      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, category: !expandedFilters.category })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '1rem',
            p: 0,
            pr: 1,
            '&:hover': { bgcolor: 'transparent' },
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

      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, price: !expandedFilters.price })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '1rem',
            p: 0,
            pr: 1,
            '&:hover': { bgcolor: 'transparent' },
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
            />
            <TextField
              label="Max Price"
              type="number"
              size="small"
              fullWidth
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Stack>
        </Collapse>
      </Box>

      <Box mb={3}>
        <Button
          fullWidth
          onClick={() =>
            setExpandedFilters({ ...expandedFilters, rating: !expandedFilters.rating })
          }
          sx={{
            justifyContent: 'space-between',
            textTransform: 'none',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: '1rem',
            p: 0,
            pr: 1,
            '&:hover': { bgcolor: 'transparent' },
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
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value="4">⭐ 4+ Stars</MenuItem>
              <MenuItem value="3">⭐ 3+ Stars</MenuItem>
              <MenuItem value="2">⭐ 2+ Stars</MenuItem>
            </Select>
          </FormControl>
        </Collapse>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <MenuItem value="-createdAt">Newest First</MenuItem>
            <MenuItem value="price">Price: Low to High</MenuItem>
            <MenuItem value="-price">Price: High to Low</MenuItem>
            <MenuItem value="-averageRating">Highest Rated</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        color="inherit"
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
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {hasDiscount && (
            <Chip
              label={`-${discountPercent}%`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontWeight: 700,
                zIndex: 2,
                fontSize: '0.7rem',
              }}
            />
          )}
          <CardMedia
            component="img"
            image={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
            alt={product.name}
            onClick={() => navigate(`/product/${product._id}`)}
            sx={{
              aspectRatio: '1/1',
              objectFit: 'contain',
              width: '100%',
              p: 2,
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          <IconButton
            aria-label="add to wishlist"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product._id);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {isWishlisted ? (
              <Favorite sx={{ color: 'error.main' }} />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1, px: 2 }}>
          <Chip
            label={product.category}
            size="small"
            sx={{ mb: 1, fontSize: '0.7rem', height: 20, bgcolor: 'grey.100' }}
          />
          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            onClick={() => navigate(`/product/${product._id}`)}
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.4,
              minHeight: '2.8em',
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              mb: 1,
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {product.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Rating
              value={product.averageRating || 0}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="caption" color="text.secondary">
              ({product.numReviews || 0})
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
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

        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0}
            sx={{
              py: 1.25,
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                transform: 'translateY(-1px)'
              },
            }}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <Box>
      <Fab
        color="primary"
        onClick={() => navigate('/cart')}
        aria-label="cart"
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 1200,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <Badge badgeContent={getCartCount()} color="error">
          <ShoppingCart sx={{ color: 'white' }} />
        </Badge>
      </Fab>

      <Hero />

      <Container maxWidth="xl" id="products-grid" sx={{ mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search for sofas, chairs, tables..."
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
                width: { xs: '100%', md: '50%' },
                mx: 'auto',
                '& .MUIOutlinedInput-root': {
                  borderRadius: '50px',
                  bgcolor: 'grey.100',
                  '&:hover': { bgcolor: 'grey.200' },
                },
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              sx={{ px: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Loading...' : `Showing ${products.length} products`}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  startIcon={<FilterList />}
                  onClick={() => setDrawerOpen(true)}
                  size="small"
                >
                  Filters
                </Button>

                <ToggleButtonGroup
                  value={scrollMode}
                  exclusive
                  onChange={(e, value) => value && setScrollMode(value)}
                  size="small"
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="infinite">Scroll</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* --- GRID V2 SYNTAX FIX --- */}
        <Grid container spacing={4}>
          {!isMobile && (
            <Grid md={3}> {/* This is a Grid Item */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: 90,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Filters
                </Typography>
                <FilterPanel />
              </Paper>
            </Grid>
          )}

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MMuiDrawer-paper': {
                width: '85%',
                maxWidth: 320,
              },
            }}
          >
            <FilterPanel />
          </Drawer>

          <Grid md={isMobile ? 12 : 9}> {/* This is a Grid Item */}
            {loading && products.length === 0 ? (
              <Box sx={{ width: '100%', minHeight: '300px' }}>
                <Loading />
              </Box>
            ) : products.length === 0 ? (
              <Box textAlign="center" py={8} sx={{ width: '100%' }}>
                <Typography variant="h6" color="text.secondary" mb={2}>
                  No products found for "{debouncedSearchQuery}"
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({
                      category: 'All', minPrice: '', maxPrice: '', minRating: '', sort: '-createdAt',
                    });
                    setSearchQuery('');
                    setPage(1);
                  }}
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
                    You've seen all products
                  </Typography>
                }
                style={{ overflow: 'visible', width: '100%' }}
              >
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid xs={12} sm={6} md={4} key={product._id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              </InfiniteScroll>
            ) : (
              <>
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid xs={12} sm={6} md={4} key={product._id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {totalPages > 1 && (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={1}
                    mt={4}
                    sx={{ width: '100%' }}
                  >
                    <Button
                      variant="outlined"
                      disabled={page === 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                    >
                      Previous
                    </Button>
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