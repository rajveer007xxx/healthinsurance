import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://82.29.162.153:8002'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const currentPath = window.location.pathname
  const adminToken = localStorage.getItem('adminToken')
  const customerToken = localStorage.getItem('customerToken')
  const superadminToken = localStorage.getItem('token')
  
  if (currentPath.startsWith('/superadmin')) {
    if (superadminToken) {
      config.headers.Authorization = `Bearer ${superadminToken}`
    }
  } else if (currentPath.startsWith('/admin')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
  } else if (currentPath.startsWith('/customer')) {
    if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`
    }
  } else {
    if (superadminToken) {
      config.headers.Authorization = `Bearer ${superadminToken}`
    } else if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`
    }
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/superadmin')) {
        localStorage.removeItem('token')
        window.location.href = '/superadmin/login'
      } else if (currentPath.startsWith('/admin')) {
        localStorage.removeItem('adminToken')
        window.location.href = '/admin/login'
      } else if (currentPath.startsWith('/customer')) {
        localStorage.removeItem('customerToken')
        window.location.href = '/customer/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
