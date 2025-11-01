import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/superadmin/login', { email, password }),
};

export const companyAPI = {
  getAll: () => api.get('/superadmin/companies'),
  getById: (id: number) => api.get(`/superadmin/companies/${id}`),
  create: (data: any) => api.post('/superadmin/companies', data),
  update: (id: number, data: any) => api.put(`/superadmin/companies/${id}`, data),
  delete: (id: number) => api.delete(`/superadmin/companies/${id}`),
  getAdmins: (id: number) => api.get(`/superadmin/companies/${id}/admins`),
  createAdmin: (id: number, data: any) => api.post(`/superadmin/companies/${id}/admins`, data),
};

export const statsAPI = {
  getPlatformStats: () => api.get('/superadmin/stats'),
};

export default api;
