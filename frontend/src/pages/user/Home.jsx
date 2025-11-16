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
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  Badge,
  Card,
  CardActionArea,
} from '@mui/material';
import {
  FilterList,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  GridView as GridViewIcon,
  DensityMedium as DensityMediumIcon,
  Chair, // NEW Icon
  KingBed, // NEW Icon
  TableRestaurant, // NEW Icon
  Deck, // NEW Icon
  Desk, // NEW Icon
  Kitchen, // NEW Icon
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import Hero from '../../components/user/Hero';
import useDebounce from '../../utils/useDebounce';
import FilterSidebar from '../../components/user/FilterSidebar';
import ProductGrid from '../../components/user/ProductGrid';

// NEW: Category data for the icon grid
const categoryIcons = [
  { name: 'Living Room', icon: <Chair /> },
  { name: 'Bedroom', icon: <KingBed /> },
  { name: 'Dining Room', icon: <TableRestaurant /> },
  { name: 'Office', icon: <Desk /> },
  { name: 'Outdoor', icon: <Deck /> },
  { name: 'Kitchen', icon: <Kitchen /> },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addToCart, getCartCount } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [scrollMode, setScrollMode] = useState('grid');
  
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '-createdAt',
  });
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  useEffect(() => {
    setFiltersOpen(!isMobile);
  }, [isMobile]);

  const searchQuery = searchParams.get('search') || '';
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const categoryFromURL = searchParams.get('category') || 'All';
    if (categoryFromURL !== filters.category) {
      setFilters((prev) => ({ ...prev, category: categoryFromURL }));
    }
  }, [searchParams, filters.category]);

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
  
  useEffect(() => {
    if (scrollMode === 'grid') {
      fetchProducts();
    }
  }, [page, scrollMode]); 

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
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: '-createdAt',
    });
    setPage(1);
    navigate('/products'); 
  };
  
  // NEW: Handle category icon click
  const handleCategoryClick = (categoryName) => {
    navigate(`/categories/${categoryName.toLowerCase().replace(' ', '-')}`);
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <Box>
      <Fab
        color="primary"
        onClick={() => navigate('/cart')}
        aria-label="cart"
        sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1200 }}
      >
        <Badge badgeContent={getCartCount()} color="error">
          <ShoppingCart sx={{ color: 'white' }} />
        </Badge>
      </Fab>
      
      {/* Only show Hero if no category or search is active */}
      {!searchParams.get('category') && !searchQuery && <Hero />}

      {/* --- NEW: CATEGORY ICON GRID --- */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
          Shop by Category
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {categoryIcons.map((cat) => (
            <Grid item xs={6} sm={4} md={2} key={cat.name}>
              <Card 
                elevation={0} 
                sx={{ 
                  border: '1px solid #eee',
                  '&:hover': { 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main'
                  } 
                }}
              >
                <CardActionArea
                  onClick={() => handleCategoryClick(cat.name)}
                  sx={{ p: 3, textAlign: 'center' }}
                >
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
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
      </Container>
      {/* --- END: CATEGORY ICON GRID --- */}


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
                  aria-label="layout mode"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridViewIcon />
                  </ToggleButton>
                  <ToggleButton value="infinite" aria-label="infinite scroll">
                    <DensityMediumIcon />
                  </ToggleButton>
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
            sx={{ '& .MuiDrawer-paper': { width: '85%', maxWidth: 320 } }}
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