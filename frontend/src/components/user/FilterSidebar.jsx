import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { ExpandLess, ExpandMore, Close } from '@mui/icons-material';

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

const FilterSidebar = ({ filters, handleFilterChange, isMobile = false, onClose = () => {} }) => {
  const [expanded, setExpanded] = useState({
    category: true,
    price: true,
    rating: true,
  });

  const toggleExpand = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleClear = () => {
    handleFilterChange('category', 'All');
    handleFilterChange('minPrice', '');
    handleFilterChange('maxPrice', '');
    handleFilterChange('minRating', '');
    handleFilterChange('sort', '-createdAt');
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      {isMobile ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      ) : (
         <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Filters
        </Typography>
      )}

      <Box mb={3}>
        <Button
          fullWidth
          onClick={() => toggleExpand('category')}
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
          {expanded.category ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expanded.category}>
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
          onClick={() => toggleExpand('price')}
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
          {expanded.price ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expanded.price}>
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
          onClick={() => toggleExpand('rating')}
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
          {expanded.rating ? <ExpandLess /> : <ExpandMore />}
        </Button>
        <Collapse in={expanded.rating}>
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
        onClick={handleClear}
      >
        Clear All
      </Button>
    </Box>
  );
};

export default FilterSidebar;