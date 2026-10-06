import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('billbuddy_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service Endpoints
export const loginApi = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const registerApi = (name, email, password, confirmPassword) => {
  return api.post('/auth/register', { name, email, password, confirmPassword });
};

export const fetchCurrentUserApi = () => {
  return api.get('/auth/me');
};

// Dashboard Service Endpoints
export const fetchDashboardDataApi = () => {
  return api.get('/dashboard');
};

export const fetchBillsApi = () => {
  return api.get('/bills');
};

export const addBillApi = (billData) => {
  return api.post('/bills', billData);
};

export const updateBillApi = (billId, billData) => {
  return api.put(`/bills/${billId}`, billData);
};

export const deleteBillApi = (billId) => {
  return api.delete(`/bills/${billId}`);
};

export const payBillApi = (billId) => {
  return api.post(`/bills/${billId}/pay`);
};

export const fetchPaymentsApi = () => {
  return api.get('/payments');
};

export default api;
