import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('hms_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Sync token to Axios client headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('hms_token', token);
    } else {
      localStorage.removeItem('hms_token');
    }

    if (user) {
      localStorage.setItem('hms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hms_user');
    }
  }, [token, user]);

  const login = async (email, password, hospitalCode = '') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, hospitalCode });
      const { token: authToken, user: userData } = res.data;
      
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const emergencyLogin = async (staffId, hospitalCode, emergencyPasscode) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/emergency-login', { staffId, hospitalCode, emergencyPasscode });
      const { token: authToken, user: userData } = res.data;
      
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Emergency verification failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout log warning:', err.message);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
    }
  };

  const role = user ? user.role : null;
  const hospitalId = user ? user.hospitalId : null;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        hospitalId,
        token,
        isAuthenticated,
        loading,
        login,
        emergencyLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
