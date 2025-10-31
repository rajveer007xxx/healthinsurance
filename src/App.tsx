import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
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
import TrackEmployee from './pages/TrackEmployee'
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
import RequireAuth from './components/RequireAuth'

function App() {
  const [, setIsAdminAuthenticated] = useState(false)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin setIsAuthenticated={setIsAdminAuthenticated} />} />
        
        <Route element={<RequireAuth />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Userlist />} />
            <Route path="customers/add" element={<AddCustomer />} />
            <Route path="plans" element={<Plans />} />
            <Route path="transactions" element={<PaymentHistory />} />
            <Route path="send-invoices" element={<SendInvoices />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="whatsapp-campaign" element={<WhatsappCampaign />} />
            <Route path="whatsapp-templates" element={<WhatsappTemplates />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="track-employee" element={<TrackEmployee />} />
            <Route path="customer-distribution" element={<CustomerDistribution />} />
            <Route path="data-management" element={<DataManagement />} />
            <Route path="connection-requests" element={<ConnectionRequest />} />
            <Route path="expenses" element={<ExpenseList />} />
            <Route path="refunds" element={<RefundList />} />
            <Route path="deleted-users" element={<DeletedUsers />} />
            <Route path="payment-gateways" element={<PaymentGateways />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
