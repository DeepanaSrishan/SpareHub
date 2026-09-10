import axios from 'axios';
import {
  mockCategories,
  mockSubCategories,
  mockSpareParts,
  mockTransactions,
  mockSummary,
} from './mockData';

const API_BASE_URL = 'http://localhost:8080/api';
const DEMO_MODE = true; // Set to false when backend is available

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors and fallback to mock data
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Fallback to mock data in demo mode or when backend is unavailable
    if (DEMO_MODE || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      const url = error.config?.url;
      
      // Auth endpoints
      if (url?.includes('/auth/login')) {
        const { username, password } = error.config?.data ? JSON.parse(error.config.data) : {};
        if (username && password) {
          return {
            data: {
              token: 'demo-token',
              userId: 1,
              username: username,
              email: username,
              role: 'INVENTORY_STAFF',
            },
          };
        }
      }
      
      if (url?.includes('/auth/register')) {
        return {
          data: {
            token: 'demo-token',
            userId: 1,
            username: 'demo',
            email: 'demo@example.com',
            role: 'INVENTORY_STAFF',
          },
        };
      }

      // Spare parts endpoints
      if (url?.includes('/spare-parts')) {
        if (url.includes('/search')) {
          const keyword = new URL(error.config.url, 'http://localhost').searchParams.get('keyword')?.toLowerCase();
          const filtered = mockSpareParts.filter(
            sp => sp.partNumber.toLowerCase().includes(keyword) || sp.name.toLowerCase().includes(keyword)
          );
          return { data: filtered };
        }
        if (url.includes('/filter')) {
          return { data: mockSpareParts };
        }
        if (url.match(/\/spare-parts\/\d+/)) {
          const id = parseInt(url.split('/').pop());
          const part = mockSpareParts.find(p => p.id === id);
          return { data: part };
        }
        return { data: mockSpareParts };
      }

      // Categories endpoints
      if (url?.includes('/categories')) {
        if (url.includes('/active')) {
          return { data: mockCategories.filter(c => c.active) };
        }
        return { data: mockCategories };
      }

      // Subcategories endpoints
      if (url?.includes('/subcategories')) {
        if (url.includes('/category/')) {
          const categoryId = parseInt(url.split('/').pop());
          return { data: mockSubCategories.filter(sc => sc.categoryId === categoryId) };
        }
        return { data: mockSubCategories };
      }

      // Inventory endpoints
      if (url?.includes('/inventory')) {
        if (url.includes('/reports')) {
          return { data: mockSummary };
        }
        if (url.includes('/low-stock')) {
          return { data: mockSpareParts.filter(sp => sp.availabilityStatus === 'LOW_STOCK') };
        }
        if (url.includes('/out-of-stock')) {
          return { data: mockSpareParts.filter(sp => sp.availabilityStatus === 'OUT_OF_STOCK') };
        }
        if (url.includes('/transactions')) {
          return { data: mockTransactions };
        }
        if (url.includes('/stock')) {
          return { data: { success: true } };
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
