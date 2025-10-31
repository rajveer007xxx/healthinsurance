import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Userlist from './pages/Userlist'
import AddCustomer from './pages/AddCustomer'
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
        
        <Route element={isAdminAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/customers" element={<Userlist />} />
          <Route path="/admin/customers/add" element={<AddCustomer />} />
          <Route path="/admin/plans" element={<Plans />} />
          <Route path="/admin/transactions" element={<PaymentHistory />} />
          <Route path="/admin/send-invoices" element={<SendInvoices />} />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/whatsapp-campaign" element={<WhatsappCampaign />} />
          <Route path="/admin/whatsapp-templates" element={<WhatsappTemplates />} />
          <Route path="/admin/employees" element={<EmployeeManagement />} />
          <Route path="/admin/customer-distribution" element={<CustomerDistribution />} />
          <Route path="/admin/data-management" element={<DataManagement />} />
          <Route path="/admin/connection-requests" element={<ConnectionRequest />} />
          <Route path="/admin/expenses" element={<ExpenseList />} />
          <Route path="/admin/refunds" element={<RefundList />} />
          <Route path="/admin/deleted-users" element={<DeletedUsers />} />
          <Route path="/admin/payment-gateways" element={<PaymentGateways />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
