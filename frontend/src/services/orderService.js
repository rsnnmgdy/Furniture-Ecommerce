import api from './api';

const orderService = {
  createOrder: async (orderData) => await api.post('/orders', orderData),
  getMyOrders: async () => await api.get('/orders/my-orders'),
  getOrder: async (id) => await api.get(`/orders/${id}`),
  
  // ADDED: User can cancel an order
  cancelOrder: async (id) => await api.put(`/orders/${id}/cancel`),
  
  // Admin
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders?${queryString}`);
  },
  updateOrderStatus: async (id, status, trackingNumber) => 
    await api.put(`/orders/${id}/status`, { status, trackingNumber }),
};

export default orderService;