import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Userlist from './pages/Userlist'
import AddCustomer from './pages/AddCustomer'
import EditCustomer from './pages/EditCustomer'
import RenewSubscription from './pages/RenewSubscription'
import CollectPayment from './pages/CollectPayment'
import CreateComplaint from './pages/CreateComplaint'
import Plans from './pages/Plans'
import PaymentHistory from './pages/PaymentHistory'
import SendInvoices from './pages/SendInvoices'
import SendInvoiceList from './pages/SendInvoiceList'
import Complaints from './pages/Complaints'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import WhatsappCampaign from './pages/WhatsappCampaign'
import WhatsappTemplates from './pages/WhatsappTemplates'
import EmployeeList from './pages/EmployeeList'
import CreateEmployee from './pages/CreateEmployee'
import EditEmployee from './pages/EditEmployee'
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
            <Route path="customers/edit/:id" element={<EditCustomer />} />
            <Route path="customers/renew/:id" element={<RenewSubscription />} />
            <Route path="payments/collect/:id" element={<CollectPayment />} />
            <Route path="plans" element={<Plans />} />
            <Route path="transactions" element={<PaymentHistory />} />
            <Route path="send-invoices" element={<SendInvoices />} />
            <Route path="invoice-list-history" element={<SendInvoiceList />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="complaints/create" element={<CreateComplaint />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="whatsapp-campaign" element={<WhatsappCampaign />} />
            <Route path="whatsapp-templates" element={<WhatsappTemplates />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/create" element={<CreateEmployee />} />
            <Route path="employees/:id/edit" element={<EditEmployee />} />
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
