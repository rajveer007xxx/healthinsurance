import axios from 'axios'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : '/api'

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
