// frontend/src/services/apiService.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080/api';

/**
 * Public endpoints that don't require auth
 */
const PUBLIC_PATHS = [
  '/auth/signup',
  '/auth/login',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/invitations/accept',
];

const INVITATION_REGEX = /^\/invitations\/[0-9a-fA-F-]{36}$/;

const normalizePath = (url = '') => url.split('?')[0];

const isPublicPath = (url = '') => {
  const path = normalizePath(url);
  return PUBLIC_PATHS.includes(path) || INVITATION_REGEX.test(path);
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  (config) => {
    const path = normalizePath(config.url || '');
    const { token, user } = useAuthStore.getState();

    config.headers = config.headers || {};

    // Skip auth for public APIs
    if (isPublicPath(path)) {
      delete config.headers.Authorization;
      delete config.headers['X-User-Id'];
      return config;
    }

    // Attach token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach user ID (backend dependency in your system)
    if (user?.id) {
      config.headers['X-User-Id'] = user.id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = normalizePath(error.config?.url || '');

    if (error.response?.status === 401 && !isPublicPath(path)) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

/**
 * AUTH SERVICE
 */
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
};

/**
 * FACILITY SERVICE
 */
export const facilityService = {
  getAll: () => api.get('/facilities'),
  getById: (id) => api.get(`/facilities/${id}`),
  search: (keyword) =>
    api.get('/facilities/search', { params: { keyword } }),
  getByType: (type) => api.get(`/facilities/type/${type}`),
  getByStatus: (status) => api.get(`/facilities/status/${status}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  remove: (id) => api.delete(`/facilities/${id}`),
};

/**
 * BOOKING SERVICE (NEW - IMPORTANT CLEANUP)
 */
export const bookingService = {
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getFacilityBookings: (facilityId) =>
    api.get(`/bookings/facility/${facilityId}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  delete: (id) => api.delete(`/bookings/${id}`),
};

/**
 * NOTIFICATION SERVICE
 */
export const notificationService = {
  getUserNotifications: (userId) =>
    api.get(`/notifications/user/${userId}`),
};

export const apiService = api;

export default api;