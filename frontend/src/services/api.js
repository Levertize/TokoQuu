import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject authorization token in request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Catch token expiration / authentication failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and trigger logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
