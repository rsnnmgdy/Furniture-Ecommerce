import React from 'react';
import { Grid, Box, Typography, Button, Stack } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';

const ProductGrid = ({
  products,
  loading,
  scrollMode,
  loadMore,
  hasMore,
  filtersOpen,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onResetFilters,
  searchQuery,
  totalPages,
  page,
  setPage,
}) => {
  // This is the logic for your 3/4 card layout.
  // When filters are open, cards take 4/12 columns (3 per row).
  // When filters are closed, cards take 3/12 columns (4 per row).
  const gridItemSizing = {
    xs: 12,
    sm: 6,
    md: filtersOpen ? 4 : 3
  };

  const productList = products.map((product) => (
    // We use the 'size' prop for Grid v2.
    // display: 'flex' is what guarantees equal card heights.
    <Grid size={gridItemSizing} key={product._id} sx={{ display: 'flex' }}>
      <ProductCard
        product={product}
        isWishlisted={wishlist.includes(product._id)}
        onToggleWishlist={onToggleWishlist}
        onAddToCart={onAddToCart}
      />
    </Grid>
  ));

  if (loading && products.length === 0) {
    return (
      <Box sx={{ width: '100%', minHeight: '300px' }}>
        <Loading />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={8} sx={{ width: '100%' }}>
        <Typography variant="h6" color="text.secondary" mb={2}>
          No products found {searchQuery && `for "${searchQuery}"`}
        </Typography>
        <Button
          variant="outlined"
          onClick={onResetFilters}
        >
          Reset Filters
        </Button>
      </Box>
    );
  }

  if (scrollMode === 'infinite') {
    return (
      <InfiniteScroll
        dataLength={products.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<Loading />}
        endMessage={
          <Typography textAlign="center" py={3} color="text.secondary" sx={{ width: '100%' }}>
            You've seen all products
          </Typography>
        }
        style={{ overflow: 'visible' }}
        // This is the fix: InfiniteScroll becomes the Grid container
        component={Grid}
        container
        spacing={3} 
      >
        {productList}
      </InfiniteScroll>
    );
  }

  // This is for "grid" (pagination) mode
  return (
    <>
      <Grid container spacing={3}>
        {productList}
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
  );
};

export default ProductGrid;