import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || 10000),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data)
};

// Suggestions API
export const suggestionsAPI = {
  create: (data) => apiClient.post('/suggestions', data),
  getAll: (params) => apiClient.get('/suggestions', { params }),
  getById: (id) => apiClient.get(`/suggestions/${id}`),
  update: (id, data) => apiClient.put(`/suggestions/${id}`, data),
  delete: (id) => apiClient.delete(`/suggestions/${id}`),
  updateStatus: (id, data) => apiClient.put(`/suggestions/${id}/status`, data),
  getStats: () => apiClient.get('/suggestions/stats')
};

// Admin API
export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserRole: (userId, data) => apiClient.put(`/admin/users/${userId}/role`, data),
  updateUserStatus: (userId, data) => apiClient.put(`/admin/users/${userId}/status`, data),
  addDeveloperNote: (suggestionId, data) => apiClient.post(`/admin/notes/${suggestionId}`, data),
  getDeveloperNotes: (suggestionId) => apiClient.get(`/admin/notes/${suggestionId}`),
  updateDeveloperNote: (noteId, data) => apiClient.put(`/admin/notes/${noteId}`, data),
  deleteDeveloperNote: (noteId) => apiClient.delete(`/admin/notes/${noteId}`),
  getAnalytics: () => apiClient.get('/admin/analytics'),
  exportCSV: () => apiClient.get('/admin/export/csv', { responseType: 'blob' })
};

export default apiClient;