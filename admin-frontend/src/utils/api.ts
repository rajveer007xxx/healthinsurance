import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),
};

export const customerAPI = {
  getAll: (params?: any) => api.get('/admin/customers', { params }),
  getById: (id: number) => api.get(`/admin/customers/${id}`),
  create: (data: any) => api.post('/admin/customers', data),
  update: (id: number, data: any) => api.put(`/admin/customers/${id}`, data),
  delete: (id: number) => api.delete(`/admin/customers/${id}`),
  renew: (id: number, planId?: number) => api.post(`/admin/customers/${id}/renew`, { plan_id: planId }),
};

export const employeeAPI = {
  getAll: () => api.get('/admin/employees'),
  getById: (id: number) => api.get(`/admin/employees/${id}`),
  create: (data: any) => api.post('/admin/employees', data),
  update: (id: number, data: any) => api.put(`/admin/employees/${id}`, data),
  delete: (id: number) => api.delete(`/admin/employees/${id}`),
};

export const planAPI = {
  getAll: (params?: any) => api.get('/admin/plans', { params }),
  create: (data: any) => api.post('/admin/plans', data),
  update: (id: number, data: any) => api.put(`/admin/plans/${id}`, data),
  delete: (id: number) => api.delete(`/admin/plans/${id}`),
};

export const paymentAPI = {
  getAll: (params?: any) => api.get('/admin/payments', { params }),
  create: (data: any) => api.post('/admin/payments', data),
};

export const invoiceAPI = {
  getAll: (params?: any) => api.get('/admin/invoices', { params }),
  create: (data: any) => api.post('/admin/invoices', data),
};

export const complaintAPI = {
  getAll: (params?: any) => api.get('/admin/complaints', { params }),
  create: (data: any) => api.post('/admin/complaints', data),
  update: (id: number, data: any) => api.put(`/admin/complaints/${id}`, data),
};

export const statsAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
};

export default api;
