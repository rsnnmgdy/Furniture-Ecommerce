import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    // Try to use Firebase token first (for authentication routes)
    let token = localStorage.getItem('firebaseToken');
    
    // Fall back to JWT token if Firebase token not available
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn('Unauthorized - clearing tokens and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

export default api;
