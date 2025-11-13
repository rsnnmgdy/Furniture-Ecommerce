import api from './api';

const reviewService = {
  createReview: async (reviewData) => await api.post('/reviews', reviewData),
  getProductReviews: async (productId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/reviews/product/${productId}?${queryString}`);
  },
  updateReview: async (id, reviewData) => 
    await api.put(`/reviews/${id}`, reviewData),
  deleteReview: async (id) => await api.delete(`/reviews/${id}`),
  getMyReviews: async () => await api.get('/reviews/my-reviews'),
};

export default reviewService;
