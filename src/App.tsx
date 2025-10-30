import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Userlist from './pages/Userlist'
import Plans from './pages/Plans'
import PaymentHistory from './pages/PaymentHistory'
import SendInvoices from './pages/SendInvoices'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import UnderConstruction from './pages/UnderConstruction'
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
          path="/admin/profile" 
          element={isAdminAuthenticated ? <AdminLayout><Profile /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/settings" 
          element={isAdminAuthenticated ? <AdminLayout><Settings /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        
        <Route 
          path="/admin/send-invoices" 
          element={isAdminAuthenticated ? <AdminLayout><SendInvoices /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        
        {/* Placeholder routes for other pages */}
        <Route 
          path="/admin/complaints" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Complaints List" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/notifications" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Notifications" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/reports" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Reports" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-campaign" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Whatsapp Campaign" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-templates" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Whatsapp Templates" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/employees" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Employee Management" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customer-distribution" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Customer Distribution" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/data-management" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Data Management" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/connection-requests" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Connection Request" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/expenses" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Expense List" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/refunds" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Refund List" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/deleted-users" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Deleted Users" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/payment-gateways" 
          element={isAdminAuthenticated ? <AdminLayout><UnderConstruction pageName="Payment Gateways" /></AdminLayout> : <Navigate to="/admin/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
