import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginApi = (data) => api.post('/api/auth/login', data);
export const getMeApi = (token) => api.get(`/api/auth/me?token=${token}`);

// User Management (Admin)
export const listUsers = () => api.get('/api/auth/users');
export const createUser = (data) => api.post('/api/auth/users', data);
export const updateUser = (id, data) => api.patch(`/api/auth/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/auth/users/${id}`);

// Grievances
export const fileGrievance = (data) => api.post('/api/grievances', data);
export const listGrievances = (params) => api.get('/api/grievances', { params });
export const trackGrievance = (trackingId) => api.get(`/api/grievances/track/${trackingId}`);
export const getGrievance = (id) => api.get(`/api/grievances/${id}`);
export const resolveGrievance = (id, data) => api.patch(`/api/grievances/${id}/resolve`, data);
export const rateGrievance = (id, data) => api.post(`/api/grievances/${id}/rate`, data);

// Whistleblower
export const fileWhistleblower = (data) => api.post('/api/whistleblower/file', data);
export const trackWhistleblower = (token) => api.get(`/api/whistleblower/track/${token}`);

// Lawyer Bot
export const askLawyerBot = (data) => api.post('/api/lawyer-bot/ask', data);

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getDashboardClusters = () => api.get('/api/dashboard/clusters');

// Public API
export const getPublicGrievances = (params) => api.get('/api/public/grievances', { params });
export const getDepartments = () => api.get('/api/public/departments');

export default api;
