import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Drawer,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  Badge,
} from '@mui/material';
import {
  FilterList,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import Hero from '../../components/user/Hero';
import useDebounce from '../../utils/useDebounce';
import FilterSidebar from '../../components/user/FilterSidebar';
import ProductGrid from '../../components/user/ProductGrid';

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
  const [drawerOpen, setDrawerOpen] = useState(false); // For mobile filter drawer
  const [scrollMode, setScrollMode] = useState('infinite');
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '-createdAt',
  });
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

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
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: '-createdAt',
    });
    setSearchQuery('');
    setPage(1);
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
                '& .MuiOutlinedInput-root': {
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
                  startIcon={
                    isMobile ? <FilterList /> : filtersOpen ? <ChevronLeft /> : <ChevronRight />
                  }
                  onClick={() => (isMobile ? setDrawerOpen(true) : setFiltersOpen(!filtersOpen))}
                  size="small"
                >
                  {isMobile ? 'Filters' : filtersOpen ? 'Hide Filters' : 'Show Filters'}
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

        <Grid container spacing={4}>
          {!isMobile && filtersOpen && (
            <Grid size={{ md: 3 }}>
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
                <FilterSidebar filters={filters} handleFilterChange={handleFilterChange} />
              </Paper>
            </Grid>
          )}

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '85%',
                maxWidth: 320,
              },
            }}
          >
            <FilterSidebar
              filters={filters}
              handleFilterChange={handleFilterChange}
              isMobile
              onClose={() => setDrawerOpen(false)}
            />
          </Drawer>

          <Grid
            size={{ md: isMobile ? 12 : filtersOpen ? 9 : 12 }}
            sx={{
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <ProductGrid
              products={products}
              loading={loading}
              scrollMode={scrollMode}
              loadMore={loadMore}
              hasMore={hasMore}
              filtersOpen={filtersOpen}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleAddToCart}
              onResetFilters={handleResetFilters}
              searchQuery={debouncedSearchQuery}
              totalPages={totalPages}
              page={page}
              setPage={setPage}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;