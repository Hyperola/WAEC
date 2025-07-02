import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyToken = useCallback(async (token) => {
    console.log('AuthContext - Verifying token:', token);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('AuthContext - User verified:', res.data);
      setUser(res.data);
      setError(null);
      return true;
    } catch (err) {
      console.error('AuthContext - Token verification failed:', err.response?.data || err.message);
      setError('Session expired. Please log in again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext - Initializing, token:', token ? 'Present' : 'Absent');
      
      if (token) {
        await verifyToken(token);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [verifyToken]);

  const login = async (username, password) => {
    console.log('AuthContext - Login attempt for:', username);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      console.log('AuthContext - Login successful:', res.data.user);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setError(null);
      await verifyToken(res.data.token); // Re-verify token after login
      return res.data;
    } catch (err) {
      console.error('AuthContext - Login failed:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthContext - Logging out user:', user?.username);
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      error,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};