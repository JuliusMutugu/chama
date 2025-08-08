import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/register', userData);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', access_token);
      
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`/api/users/${user.id}`, profileData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Update failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWalletAddress = async (walletAddress) => {
    if (!user) return;
    
    try {
      await axios.put(`/api/users/${user.id}/wallet`, null, {
        params: { wallet_address: walletAddress }
      });
      
      setUser(prev => ({ ...prev, wallet_address: walletAddress }));
      toast.success('Wallet address updated!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update wallet address';
      toast.error(message);
      throw error;
    }
  };

  // API helpers
  const apiCall = async (method, url, data = null) => {
    try {
      const config = {
        method,
        url,
        ...(data && { data })
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'API call failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    updateWalletAddress,
    apiCall
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
