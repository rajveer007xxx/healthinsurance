import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Userlist from './pages/Userlist'
import Plans from './pages/Plans'
import PaymentHistory from './pages/PaymentHistory'
import SendInvoices from './pages/SendInvoices'
import Complaints from './pages/Complaints'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import WhatsappCampaign from './pages/WhatsappCampaign'
import WhatsappTemplates from './pages/WhatsappTemplates'
import EmployeeManagement from './pages/EmployeeManagement'
import CustomerDistribution from './pages/CustomerDistribution'
import DataManagement from './pages/DataManagement'
import ConnectionRequest from './pages/ConnectionRequest'
import ExpenseList from './pages/ExpenseList'
import RefundList from './pages/RefundList'
import DeletedUsers from './pages/DeletedUsers'
import PaymentGateways from './pages/PaymentGateways'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AdminLayout from './components/AdminLayout'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken')
  })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) setIsAdminAuthenticated(true)
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin setIsAuthenticated={setIsAdminAuthenticated} />} />
        
        <Route 
          path="/admin/dashboard" 
          element={isAdminAuthenticated ? <AdminLayout><Dashboard /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customers" 
          element={isAdminAuthenticated ? <AdminLayout><Userlist /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/plans" 
          element={isAdminAuthenticated ? <AdminLayout><Plans /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/transactions" 
          element={isAdminAuthenticated ? <AdminLayout><PaymentHistory /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/send-invoices" 
          element={isAdminAuthenticated ? <AdminLayout><SendInvoices /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/complaints" 
          element={isAdminAuthenticated ? <AdminLayout><Complaints /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/notifications" 
          element={isAdminAuthenticated ? <AdminLayout><Notifications /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/reports" 
          element={isAdminAuthenticated ? <AdminLayout><Reports /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-campaign" 
          element={isAdminAuthenticated ? <AdminLayout><WhatsappCampaign /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-templates" 
          element={isAdminAuthenticated ? <AdminLayout><WhatsappTemplates /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/employees" 
          element={isAdminAuthenticated ? <AdminLayout><EmployeeManagement /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customer-distribution" 
          element={isAdminAuthenticated ? <AdminLayout><CustomerDistribution /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/data-management" 
          element={isAdminAuthenticated ? <AdminLayout><DataManagement /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/connection-requests" 
          element={isAdminAuthenticated ? <AdminLayout><ConnectionRequest /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/expenses" 
          element={isAdminAuthenticated ? <AdminLayout><ExpenseList /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/refunds" 
          element={isAdminAuthenticated ? <AdminLayout><RefundList /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/deleted-users" 
          element={isAdminAuthenticated ? <AdminLayout><DeletedUsers /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/payment-gateways" 
          element={isAdminAuthenticated ? <AdminLayout><PaymentGateways /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/profile" 
          element={isAdminAuthenticated ? <AdminLayout><Profile /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/settings" 
          element={isAdminAuthenticated ? <AdminLayout><Settings /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
