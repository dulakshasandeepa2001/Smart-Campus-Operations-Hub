import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080/api';

const PUBLIC_API_PATHS = [
  '/auth/signup',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/invitations/accept',
];

const INVITATION_TOKEN_PATH = /^\/invitations\/[0-9a-fA-F-]{36}$/;

const getRequestPath = (url = '') => url.split('?')[0];

const isPublicApiPath = (url = '') => {
  const requestPath = getRequestPath(url);
  return PUBLIC_API_PATHS.includes(requestPath) || INVITATION_TOKEN_PATH.test(requestPath);
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token and user ID to requests
apiClient.interceptors.request.use(
  (config) => {
    const requestPath = getRequestPath(config.url || '');
    const isPublicRequest = isPublicApiPath(requestPath);
    const { token, user } = useAuthStore.getState();

    config.headers = config.headers || {};

    if (isPublicRequest) {
      delete config.headers.Authorization;
      delete config.headers['X-User-Id'];
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (user && user.id) {
      config.headers['X-User-Id'] = user.id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestPath = getRequestPath(error.config?.url || '');

    if (error.response?.status === 401 && !isPublicApiPath(requestPath)) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
};

export const facilityService = {
  getAllFacilities: () => apiClient.get('/facilities'),
  getFacilityById: (id) => apiClient.get(`/facilities/${id}`),
  searchFacilities: (keyword) => apiClient.get('/facilities/search', { params: { keyword } }),
  getFacilitiesByType: (type) => apiClient.get(`/facilities/type/${type}`),
  getFacilitiesByStatus: (status) => apiClient.get(`/facilities/status/${status}`),
  getFacilitiesByCapacity: (capacity) => apiClient.get(`/facilities/capacity/${capacity}`),
  createFacility: (data) => apiClient.post('/facilities', data),
  updateFacility: (id, data) => apiClient.put(`/facilities/${id}`, data),
  deleteFacility: (id) => apiClient.delete(`/facilities/${id}`),
};

export const apiService = apiClient;

export default apiClient;
