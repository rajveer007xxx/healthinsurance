import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://82.29.162.153:8002'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken')
  const customerToken = localStorage.getItem('customerToken')
  
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`
  }
  
  return config
})

export default api
