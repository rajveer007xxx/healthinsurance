import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAuth() {
  const adminToken = localStorage.getItem('adminToken')
  
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />
  }
  
  return <Outlet />
}
