import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
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
  IconButton,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  CloudUpload,
  Close,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import *as Yup from 'yup';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../../components/common/Loading';

const categories = ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor', 'Storage', 'Decor', 'Kitchen'];
const PRIMARY_GRADIENT = 'linear-gradient(135deg, #C67C4E 0%, #8B6F47 100%)';

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
  
  // --- STATE FOR IMAGES ---
  const [imageFiles, setImageFiles] = useState([]); // New files to upload
  const [imagesToDelete, setImagesToDelete] = useState([]); // publicIds to delete
  const [existingImages, setExistingImages] = useState([]); // For UI display
  
  const [searchTerm, setSearchTerm] = useState('');

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

        // 1. Add new image files
        console.log('🖼️ ImageFiles to upload:', imageFiles.length);
        imageFiles.forEach((file, index) => {
          console.log(`  [${index}] ${file.name} (${file.size} bytes, ${file.type})`);
          formData.append('images', file);
        });

        // 2. Add list of image publicIds to delete
        if (imagesToDelete.length > 0) {
          formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
        }

        console.log('📤 FormData entries:', Array.from(formData.entries()).map(([k, v]) => `${k}: ${v instanceof File ? v.name : typeof v}`));

        let response;
        if (editingProduct) {
          response = await productService.updateProduct(editingProduct._id, formData);
          toast.success('Product updated!');
        } else {
          response = await productService.createProduct(formData);
          toast.success('Product created!');
        }

        // --- FIX: Directly update the product list with the API response to ensure new images display ---
        const newProduct = response.product;
        setProducts(prevProducts => {
            const index = prevProducts.findIndex(p => p._id === newProduct._id);
            if (index !== -1) {
                // If existing, replace it in the list
                return prevProducts.map(p => p._id === newProduct._id ? newProduct : p);
            } else {
                // If new, prepend it to the list
                return [newProduct, ...prevProducts];
            }
        });
        // --- END FIX ---

        setDialogOpen(false);
      } catch (error) {
        toast.error(error.message || 'Failed to save product');
      }
    },
  });

  // --- Resets all states when dialog opens ---
  const openAddDialog = () => {
    setEditingProduct(null);
    formik.resetForm();
    setImageFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setDialogOpen(true);
  };
  
  // FIX APPLIED: Fetch product details again before opening dialog to ensure fresh image data
  const openEditDialog = async (product) => {
    try {
      setLoading(true);
      // Fetch the most up-to-date product data from the server
      const freshData = await productService.getProduct(product._id);
      const freshProduct = freshData.product;

      setEditingProduct(freshProduct);
      formik.setValues({
        name: freshProduct.name,
        description: freshProduct.description,
        price: freshProduct.price,
        salePrice: freshProduct.salePrice || '',
        category: freshProduct.category,
        material: freshProduct.material,
        stock: freshProduct.stock,
        color: freshProduct.color?.join(', ') || '',
      });
      setImageFiles([]);
      // Use fresh data to populate existing images
      setExistingImages(freshProduct.images || []); 
      setImagesToDelete([]);
      setDialogOpen(true);
    } catch (error) {
        toast.error('Failed to load product details for editing.');
    } finally {
        setLoading(false);
    }
  };


  // --- Handlers for image add/remove ---
  const handleNewImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...newFiles]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveNewImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (image) => {
    // Add publicId to delete list
    setImagesToDelete([...imagesToDelete, image.publicId]);
    // Remove from UI preview
    setExistingImages(existingImages.filter(img => img._id !== image._id));
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

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ background: PRIMARY_GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Products
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Manage your furniture inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            background: PRIMARY_GRADIENT,
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
          }}
          onClick={openAddDialog} // Use new handler
        >
          Add Product
        </Button>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3, borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#FAFAFA' } }}
            InputProps={{ startAdornment: <Search sx={{ mr: 1, color: '#999' }} /> }}
          />
          {selected.length > 0 && (
            <>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {selected.length} selected
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                sx={{ borderRadius: '8px' }}
              >
                Delete
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={() => {
                      if (selected.length === filteredProducts.length) {
                        setSelected([]);
                      } else {
                        setSelected(filteredProducts.map(p => p._id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#666' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow
                    key={product._id}
                    sx={{ '&:hover': { backgroundColor: '#FAFAFA' }, backgroundColor: selected.includes(product._id) ? '#F0F0F0' : 'inherit' }}
                    selected={selected.includes(product._id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(product._id)}
                        onChange={() => {
                          if (selected.includes(product._id)) {
                            setSelected(selected.filter(id => id !== product._id));
                          } else {
                            setSelected([...selected, product._id]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {/* DIAGNOSTIC LOG AND ROBUST IMAGE CHECK */}
                      {console.log(`[Admin] Product "${product.name}" images:`, product.images)}
                      <Box
                        component="img"
                        src={product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.jpg'}
                        alt={product.name}
                        sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px', border: '1px solid #E8E8E8' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>{product.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        size="small"
                        sx={{ background: 'linear-gradient(135deg, #C67C4E20, #C67C4E10)', color: '#C67C4E', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#C67C4E' }}>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        size="small"
                        sx={{
                          background: product.stock < 10 ? 'linear-gradient(135deg, #FF6B6B20, #FF6B6B10)' : 'linear-gradient(135deg, #4CAF5020, #4CAF5010)',
                          color: product.stock < 10 ? '#FF6B6B' : '#4CAF50',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: product.isActive ? 'linear-gradient(135deg, #4CAF5020, #4CAF5010)' : 'linear-gradient(135deg, #99999920, #99999910)',
                          color: product.isActive ? '#4CAF50' : '#999',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => openEditDialog(product)} sx={{ color: '#C67C4E', '&:hover': { backgroundColor: '#C67C4E20' } }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product._id)}
                        sx={{ color: '#FF6B6B', '&:hover': { backgroundColor: '#FF6B6B20' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))}
          sx={{ borderTop: '1px solid #EFEFEF', backgroundColor: '#FAFAFA' }}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle sx={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700 }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Product Details */}
              <TextField label="Product Name" fullWidth {...formik.getFieldProps('name')} error={formik.touched.name && !!formik.errors.name} helperText={formik.touched.name && formik.errors.name} />
              <FormControl fullWidth error={formik.touched.category && !!formik.errors.category}>
                <InputLabel>Category</InputLabel>
                <Select {...formik.getFieldProps('category')} label="Category">
                  {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Price" type="number" fullWidth {...formik.getFieldProps('price')} error={formik.touched.price && !!formik.errors.price} />
              <TextField label="Sale Price" type="number" fullWidth {...formik.getFieldProps('salePrice')} />
              <TextField label="Material" fullWidth {...formik.getFieldProps('material')} error={formik.touched.material && !!formik.errors.material} />
              <TextField label="Stock" type="number" fullWidth {...formik.getFieldProps('stock')} error={formik.touched.stock && !!formik.errors.stock} />
              <TextField label="Colors (comma-separated)" fullWidth {...formik.getFieldProps('color')} sx={{ gridColumn: '1 / -1' }} />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                {...formik.getFieldProps('description')}
                error={formik.touched.description && !!formik.errors.description}
                helperText={formik.touched.description && formik.errors.description}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>

            {/* Image Upload Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Product Images
            </Typography>

            {/* --- START FIX: EXISTING IMAGES PREVIEW --- */}
            {editingProduct && existingImages.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                  Current Images ({existingImages.length})
                </Typography>
                <Grid container spacing={1}>
                  {existingImages.map((image) => (
                    <Grid item xs={6} sm={4} md={3} key={image._id}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={image.url}
                          alt="product"
                          sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'contain',
                            border: '1px solid #E8E8E8',
                            borderRadius: '8px',
                            backgroundColor: '#FAFAFA',
                            display: 'block',
                          }}
                        />
                        <Tooltip title="Remove image">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingImage(image)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255,107,107,0.9)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(255,107,107,1)' },
                              zIndex: 10,
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {/* --- END FIX --- */}

            {/* New Images Upload */}
            <Paper sx={{ p: 2, textAlign: 'center', border: '2px dashed #C67C4E', borderRadius: '8px', backgroundColor: '#FAFAFA', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { borderColor: '#8B6F47', backgroundColor: '#F5F5F5' } }} component="label">
              <input
                key={`file-input-${imageFiles.length}`}
                hidden
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageUpload}
              />
              <CloudUpload sx={{ fontSize: 40, color: '#C67C4E', mb: 1 }} />
              <Typography variant="body2" fontWeight={600} sx={{ color: '#C67C4E' }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                PNG, JPG, WebP up to 5MB (Max 10 images total)
              </Typography>
            </Paper>

            {/* --- START FIX: NEW IMAGES PREVIEW --- */}
            {imageFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                  New Images to Upload ({imageFiles.length})
                </Typography>
                <Grid container spacing={1}>
                  {imageFiles.map((file, index) => (
                    <Grid item xs={6} sm={4} md={3} key={`${file.name}-${index}`}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'cover',
                            border: '2px solid #C67C4E',
                            borderRadius: '8px',
                            backgroundColor: '#FAFAFA',
                            display: 'block',
                          }}
                        />
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNewImage(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255,107,107,0.9)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(255,107,107,1)' },
                              zIndex: 10,
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {/* --- END FIX --- */}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ background: PRIMARY_GRADIENT }}>
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Products;