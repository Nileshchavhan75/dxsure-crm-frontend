import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

// Client APIs
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Ticket APIs
export const ticketAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// DayPlan APIs
export const dayPlanAPI = {
  getAll: () => api.get('/dayplans'),
  getById: (id) => api.get(`/dayplans/${id}`),
  create: (data) => api.post('/dayplans', data),
  update: (id, data) => api.put(`/dayplans/${id}`, data),
  delete: (id) => api.delete(`/dayplans/${id}`),
};

// Vendor APIs
export const vendorAPI = {
  getAll: () => api.get('/vendors'),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// PettyCash APIs
export const pettyCashAPI = {
  getAll: () => api.get('/pettycash'),
  create: (data) => api.post('/pettycash', data),
  update: (id, data) => api.put(`/pettycash/${id}`, data),
};

// Finance APIs
export const financeAPI = {
  getAll: () => api.get('/finance'),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
};

// User APIs (Admin)
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Track Record APIs (Admin)
export const trackAPI = {
  getAll: () => api.get('/track'),
};

export default api;