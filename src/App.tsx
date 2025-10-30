import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Userlist from './pages/Userlist'
import Plans from './pages/Plans'
import PaymentHistory from './pages/PaymentHistory'
import SendManualInvoice from './pages/SendManualInvoice'
import AddonBills from './pages/AddonBills'
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
import AdminProfile from './pages/AdminProfile'
import Settings from './pages/Settings'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken')
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/userlist" element={<ProtectedRoute><AdminLayout><Userlist /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/plans" element={<ProtectedRoute><AdminLayout><Plans /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute><AdminLayout><PaymentHistory /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/send-invoices" element={<ProtectedRoute><AdminLayout><SendManualInvoice /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/addon-bills" element={<ProtectedRoute><AdminLayout><AddonBills /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute><AdminLayout><Complaints /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminLayout><Notifications /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><AdminLayout><Reports /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/whatsapp-campaign" element={<ProtectedRoute><AdminLayout><WhatsappCampaign /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/whatsapp-templates" element={<ProtectedRoute><AdminLayout><WhatsappTemplates /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/employee-management" element={<ProtectedRoute><AdminLayout><EmployeeManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/customer-distribution" element={<ProtectedRoute><AdminLayout><CustomerDistribution /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/data-management" element={<ProtectedRoute><AdminLayout><DataManagement /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/connection-request" element={<ProtectedRoute><AdminLayout><ConnectionRequest /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/expense-list" element={<ProtectedRoute><AdminLayout><ExpenseList /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/refund-list" element={<ProtectedRoute><AdminLayout><RefundList /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/deleted-users" element={<ProtectedRoute><AdminLayout><DeletedUsers /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/payment-gateways" element={<ProtectedRoute><AdminLayout><PaymentGateways /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
