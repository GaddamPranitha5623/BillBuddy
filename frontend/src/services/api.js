import axios from 'axios';

const API_BASE_URL = 'https://billbuddy-sdla.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to request headers
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

// ==================== AUTH APIs ====================

// Login
export const loginApi = (email, password) => {
  return api.post('/auth/login', {
    email,
    password,
  });
};

// Register a new account
export const registerApi = (
  name,
  email,
  password,
  confirmPassword
) => {
  return api.post('/auth/register', {
    name,
    email,
    password,
    confirmPassword,
  });
};

// Get the currently logged-in user
export const fetchCurrentUserApi = () => {
  return api.get('/auth/me');
};

// ==================== DASHBOARD APIs ====================

// Get dashboard data
export const fetchDashboardDataApi = () => {
  return api.get('/dashboard');
};

// ==================== BILLS APIs ====================

// Get all bills
export const fetchBillsApi = () => {
  return api.get('/bills');
};

// Add a new bill
export const addBillApi = (billData) => {
  return api.post('/bills', billData);
};

// Update an existing bill
export const updateBillApi = (billId, billData) => {
  return api.put(`/bills/${billId}`, billData);
};

// Delete a bill
export const deleteBillApi = (billId) => {
  return api.delete(`/bills/${billId}`);
};

// Mark a bill as paid
export const payBillApi = (billId) => {
  return api.post(`/bills/${billId}/pay`);
};

// ==================== PAYMENTS APIs ====================

// Get payment history
export const fetchPaymentsApi = () => {
  return api.get('/payments');
};

// Export the configured Axios instance
export default api;