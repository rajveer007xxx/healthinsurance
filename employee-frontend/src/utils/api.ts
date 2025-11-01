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
    api.post('/auth/employee/login', { email, password }),
};

export const employeeAPI = {
  getAssignedCustomers: () => api.get('/employee/assigned-customers'),
  collectPayment: (data: any) => api.post('/employee/collect-payment', data),
  updateLocation: (data: any) => api.post('/employee/update-location', data),
  getLocationHistory: () => api.get('/employee/location-history'),
};

export default api;
