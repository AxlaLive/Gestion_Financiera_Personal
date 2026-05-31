import axios from 'axios';
import {
  API_BASE_URL,
  clearAuthSession,
  getStoredToken,
  isPublicAuthRequest,
  shouldHandleUnauthorized,
} from '@/lib/api-config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const requestUrl = String(config.url ?? '');
  if (isPublicAuthRequest(requestUrl)) {
    delete config.headers.Authorization;
    return config;
  }
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = String(error.config?.url ?? '');
      if (shouldHandleUnauthorized(requestUrl)) {
        clearAuthSession({ redirect: true });
      }
    }
    return Promise.reject(error);
  },
);

export default api;
