import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, fetchCurrentUserApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('billbuddy_token'));
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on page load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('billbuddy_token');
      if (storedToken) {
        try {
          const response = await fetchCurrentUserApi();
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error("Session restore failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('billbuddy_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await registerApi(name, email, password, confirmPassword);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('billbuddy_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('billbuddy_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
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
