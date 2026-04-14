import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
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

export default apiClient;
