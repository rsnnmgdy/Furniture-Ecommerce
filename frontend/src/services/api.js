import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // Removed default Content-Type header here to allow FormData to override it
  headers: {},
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('firebaseToken') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FIX APPLIED: For FormData requests (files), unset Content-Type so the browser sets it correctly with the boundary.
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    } else {
        // MUST BE DELETED for Axios to correctly set multipart/form-data boundary.
        delete config.headers['Content-Type']; 
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
      
      // Keep fix to prevent reload on auth failure
      const isAuthEndpoint = 
        url.includes('/auth/login') ||
        url.includes('/auth/register') || 
        url.includes('/auth/firebase-login'); 

      if (!isAuthEndpoint) {
        console.warn('Unauthorized - clearing tokens and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('firebaseToken');
        localStorage.removeItem('user');
        window.location.href = '/login'; 
      }
    }
    
    // Reject the promise with the specific server error message
    return Promise.reject({ 
        message: error.response?.data?.message || error.message, 
        status: error.response?.status, 
        data: error.response?.data 
    });
  }
);

export default api;