import api from './api';

const cartService = {
  getCart: async () => await api.get('/cart'),
  addToCart: async (productId, quantity) => 
    await api.post('/cart/add', { productId, quantity }),
  updateCartItem: async (productId, quantity) => 
    await api.put('/cart/update', { productId, quantity }),
  removeFromCart: async (productId) => 
    await api.delete(`/cart/remove/${productId}`),
  clearCart: async () => await api.delete('/cart/clear'),
};

export default cartService;
