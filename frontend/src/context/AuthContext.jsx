import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ministore_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ministore_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Sync token to api & check current profile
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ministore_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('ministore_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.warn('Sessiya muddati tugadi:', err.message);
          localStorage.removeItem('ministore_token');
          localStorage.removeItem('ministore_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data.data;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('ministore_user', JSON.stringify(userData));
    localStorage.setItem('ministore_token', jwtToken);

    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const verifyEmail = async (verificationToken, name = null) => {
    const url = name
      ? `/auth/verify-email/${verificationToken}?name=${encodeURIComponent(name)}`
      : `/auth/verify-email/${verificationToken}`;
    const res = await api.get(url);
    if (res.data?.data?.token) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('ministore_user', JSON.stringify(userData));
      localStorage.setItem('ministore_token', jwtToken);
    }
    return res.data;
  };

  const resendVerification = async (email) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ministore_token');
    localStorage.removeItem('ministore_user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
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
