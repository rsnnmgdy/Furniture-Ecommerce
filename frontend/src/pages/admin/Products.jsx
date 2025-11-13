import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const categories = [
  'Living Room',
  'Bedroom',
  'Dining Room',
  'Office',
  'Outdoor',
  'Storage',
  'Decor',
  'Kitchen',
];

const productSchema = Yup.object({
  name: Yup.string().min(3).max(100).required('Name is required'),
  description: Yup.string().min(10).max(2000).required('Description is required'),
  price: Yup.number().min(0).required('Price is required'),
  category: Yup.string().required('Category is required'),
  material: Yup.string().required('Material is required'),
  stock: Yup.number().min(0).required('Stock is required'),
});

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({ limit: 100 });
      setProducts(response.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      salePrice: '',
      category: '',
      material: '',
      stock: '',
      color: '',
    },
    validationSchema: productSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key]) {
            if (key === 'color') {
              formData.append(key, JSON.stringify(values[key].split(',').map(c => c.trim())));
            } else {
              formData.append(key, values[key]);
            }
          }
        });

        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        if (editingProduct) {
          await productService.updateProduct(editingProduct._id, formData);
          toast.success('Product updated!');
        } else {
          await productService.createProduct(formData);
          toast.success('Product created!');
        }

        setDialogOpen(false);
        setEditingProduct(null);
        setImageFiles([]);
        resetForm();
        fetchProducts();
      } catch (error) {
        toast.error(error.message || 'Failed to save product');
      }
    },
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    formik.setValues({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || '',
      category: product.category,
      material: product.material,
      stock: product.stock,
      color: product.color?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Bulk Delete (MP1 - 20pts requirement)
  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }

    if (!window.confirm(`Delete ${selected.length} products?`)) return;

    try {
      await productService.bulkDeleteProducts(selected);
      toast.success(`${selected.length} products deleted`);
      setSelected([]);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete products');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = products.map((p) => p._id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Products Management
        </Typography>
        <Box display="flex" gap={2}>
          {selected.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingProduct(null);
              formik.resetForm();
              setImageFiles([]);
              setDialogOpen(true);
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Products DataTable (MP1 requirement) */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === products.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => {
                const isItemSelected = isSelected(product._id);

                return (
                  <TableRow key={product._id} selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectOne(product._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        size="small"
                        color={product.stock < 10 ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(product)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={products.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sale Price (Optional)"
                  name="salePrice"
                  value={formik.values.salePrice}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    label="Category"
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Material"
                  name="material"
                  value={formik.values.material}
                  onChange={formik.handleChange}
                  error={formik.touched.material && Boolean(formik.errors.material)}
                  helperText={formik.touched.material && formik.errors.material}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock"
                  name="stock"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  error={formik.touched.stock && Boolean(formik.errors.stock)}
                  helperText={formik.touched.stock && formik.errors.stock}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Colors (comma separated)"
                  name="color"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  placeholder="Brown, Black, White"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  />
                </Button>
                {imageFiles.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {imageFiles.length} file(s) selected
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products;
