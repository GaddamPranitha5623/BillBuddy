
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  loginApi,
  registerApi,
  fetchCurrentUserApi,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('billbuddy_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUserApi();

        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('billbuddy_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const data = response.data;

      if (!data.token || !data.user) {
        return {
          success: false,
          error: 'Login response is missing user or token information.',
        };
      }

      localStorage.setItem('billbuddy_token', data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Login failed. Please try again.',
      };
    }
  };

  const register = async (
    name,
    email,
    password,
    confirmPassword
  ) => {
    try {
      const response = await registerApi(
        name,
        email,
        password,
        confirmPassword
      );

      const data = response.data;

      if (data.token && data.user) {
        localStorage.setItem('billbuddy_token', data.token);
        setUser(data.user);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('billbuddy_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
