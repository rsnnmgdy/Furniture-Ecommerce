import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import Loading from '../components/common/Loading'; // Import Loading

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // This calls your /api/auth/login route
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  // This calls your /api/auth/register route
  const register = async (userData) => {
    const response = await authService.register(userData);
    // Don't log in user on register, let them login
    // setUser(response.user); 
    return response;
  };

  // This calls your /api/auth/firebase-login route
  const firebaseLogin = async (firebaseToken) => {
    const response = await authService.firebaseLogin(firebaseToken);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => authService.isAuthenticated();
  const isAdmin = () => authService.isAdmin();

  const value = {
    user,
    login,
    register,
    firebaseLogin, // This is for Google/FB
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    loading,
  };

  if (loading) {
    return <Loading />; // Show loading on initial app load
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};