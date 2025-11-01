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
      window.location.href = '/customer/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/customer/login', { email, password }),
};

export const customerAPI = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data: any) => api.put('/customer/profile', data),
  getInvoices: () => api.get('/customer/invoices'),
  getPayments: () => api.get('/customer/payments'),
  getComplaints: () => api.get('/customer/complaints'),
  createComplaint: (data: any) => api.post('/customer/complaints', data),
};

export default api;
