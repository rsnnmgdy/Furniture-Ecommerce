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
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // FIX APPLIED: DO NOT REDIRECT/CLEAR TOKENS if the failure happened on these specific Auth routes
      const isAuthEndpoint = 
        url.includes('/auth/login') ||
        url.includes('/auth/register') || 
        url.includes('/auth/firebase-login'); 

      if (!isAuthEndpoint) {
        console.warn('Unauthorized - clearing tokens and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Only redirect if trying to access a protected route
      }
    }
    
    // If we're on an auth endpoint, we reject the promise with the specific server error
    return Promise.reject({ 
        message: error.response?.data?.message || error.message, 
        status: error.response?.status, 
        data: error.response?.data 
    });
  }
);

export default api;