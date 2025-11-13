import api from './api';

const productService = {
  // Get all products with filters (Quiz 1 requirement)
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products?${queryString}`);
  },

  // Get single product
  getProduct: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return await api.get('/products/featured');
  },

  // Create product (Admin)
  createProduct: async (formData) => {
    return await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update product (Admin)
  updateProduct: async (id, formData) => {
    return await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  // Bulk delete products (Admin)
  bulkDeleteProducts: async (productIds) => {
    return await api.post('/products/bulk-delete', { productIds });
  },

  // Delete product image (Admin)
  deleteProductImage: async (productId, imageId) => {
    return await api.delete(`/products/${productId}/images/${imageId}`);
  },
};

export default productService;
