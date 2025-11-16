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
  Card,
  CardActionArea,
} from '@mui/material';
import {
  FilterList,
  ChevronLeft,
  ChevronRight,
  Search,
  Chair,
  KingBed,
  TableRestaurant,
  Deck,
  Desk,
  Kitchen,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import useDebounce from '../../utils/useDebounce';
import FilterSidebar from '../../components/user/FilterSidebar';
import ProductGrid from '../../components/user/ProductGrid';

// Category data for the icon grid
const categoryIcons = [
  { name: 'Living Room', icon: <Chair /> },
  { name: 'Bedroom', icon: <KingBed /> },
  { name: 'Dining Room', icon: <TableRestaurant /> },
  { name: 'Office', icon: <Desk /> },
  { name: 'Outdoor', icon: <Deck /> },
  { name: 'Kitchen', icon: <Kitchen /> },
];

// Helper function to make the category title look nice
const formatTitle = (title) => {
  if (!title || title === 'All') return 'All Products';
  return title
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    category: categoryName || searchParams.get('category') || 'All',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '-createdAt',
  });
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const categoryFromURL = categoryName || searchParams.get('category') || 'All';
    if (categoryFromURL !== filters.category) {
       setFilters((prev) => ({ ...prev, category: categoryFromURL }));
    }
  }, [categoryName, searchParams, filters.category]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchProducts();
    }
  }, [filters, debouncedSearchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: 10,
        sort: filters.sort,
      };

      if (filters.category !== 'All') params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;

      const response = await productService.getProducts(params); 
      setProducts(response.products);
      setTotalPages(response.totalPages);

    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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
    setPage(1); 
    
    if (name === 'category' && value !== 'All') {
        navigate(`/categories/${value}`, { replace: true });
    } else if (name === 'category' && value === 'All') {
        navigate('/products', { replace: true });
    }
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
    navigate('/products', { replace: true });
  };

  // Handle category icon click
  const handleCategoryClick = (categoryName) => {
    // This will trigger the filter change and URL update
    handleFilterChange('category', categoryName);
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <Box>
      <Container maxWidth="xl" id="products-grid" sx={{ py: 4, mb: 6 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', textTransform: 'capitalize', mb: 4 }}
        >
          {formatTitle(filters.category)}
        </Typography>

        {/* --- NEW: CATEGORY ICON GRID --- */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Browse by Category
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {categoryIcons.map((cat) => (
              <Grid item xs={6} sm={4} md={2} key={cat.name}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: '1px solid #eee',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                    } 
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCategoryClick(cat.name)}
                    sx={{ p: 3, textAlign: 'center' }}
                  >
                    <Box sx={{ color: 'primary.main', mb: 1.5 }}>
                      {React.cloneElement(cat.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {cat.name}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* --- END: CATEGORY ICON GRID --- */}
        
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
              placeholder="Search in this category..."
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
                  bgcolor: 'background.paper',
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
              scrollMode="grid" // Hardcode to "grid" for pagination
              loadMore={() => {}}
              hasMore={false}
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

export default ProductListPage;