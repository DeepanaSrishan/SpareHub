import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const formatLKR = (amount) => {
  if (amount === undefined || amount === null) return 'Rs. 0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const api = {
  // Authentication
  register: async (userData) => {
    const res = await client.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await client.post('/auth/login', credentials);
    return res.data;
  },

  // Customer Profile
  getProfile: async (userId) => {
    const res = await client.get(`/users/${userId}/profile`);
    return res.data;
  },

  updateProfile: async (userId, data) => {
    const res = await client.put(`/users/${userId}/profile`, data);
    return res.data;
  },

  // Loyalty Tiers & Customers for Sales Staff
  getLoyaltyTiers: async () => {
    const res = await client.get('/loyalty-tiers');
    return res.data;
  },

  getCustomers: async (query = '') => {
    const url = query ? `/customers?query=${encodeURIComponent(query)}` : '/customers';
    const res = await client.get(url);
    return res.data;
  },

  assignLoyaltyTier: async (customerId, tierId) => {
    const res = await client.put(`/customers/${customerId}/loyalty-tier`, { tierId });
    return res.data;
  },

  autoAssignTier: async (customerId) => {
    const res = await client.post(`/customers/${customerId}/auto-tier`);
    return res.data;
  },

  // Customer orders & transactions for Sales Staff
  getCustomerOrders: async (customerId) => {
    const res = await client.get(`/customers/${customerId}/orders`);
    return res.data;
  },

  getCustomerSummary: async (customerId) => {
    const res = await client.get(`/customers/${customerId}/summary`);
    return res.data;
  },

  // Role-Based Access Control (RBAC) & User Management
  getAllUsers: async () => {
    const res = await client.get('/admin/users');
    return res.data;
  },

  updateUserRoles: async (userId, roleNames) => {
    const res = await client.put(`/admin/users/${userId}/roles`, { roleNames });
    return res.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const res = await client.put(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },

  getSystemStats: async () => {
    const res = await client.get('/admin/stats');
    return res.data;
  },

  // Notifications
  getNotifications: async (userId) => {
    const res = await client.get(`/notifications/user/${userId}`);
    return res.data;
  },

  markNotificationRead: async (notificationId) => {
    const res = await client.put(`/notifications/${notificationId}/read`);
    return res.data;
  },
};

export default api;
