import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import AdminLogin from './pages/AdminLogin'
import CustomerLogin from './pages/CustomerLogin'
import AdminDashboard from './pages/AdminDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import Customers from './pages/Customers'
import AddCustomer from './pages/AddCustomer'
import TransactionHistory from './pages/TransactionHistory'
import Plans from './pages/Plans'
import SendInvoices from './pages/SendInvoices'
import AddonBills from './pages/AddonBills'
import Complaints from './pages/Complaints'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import WhatsappCampaign from './pages/WhatsappCampaign'
import WhatsappTemplates from './pages/WhatsappTemplates'
import Employees from './pages/Employees'
import CustomerDistribution from './pages/CustomerDistribution'
import DataManagement from './pages/DataManagement'
import ConnectionRequests from './pages/ConnectionRequests'
import Expenses from './pages/Expenses'
import Refunds from './pages/Refunds'
import DeletedUsers from './pages/DeletedUsers'
import PaymentGateways from './pages/PaymentGateways'
import AdminProfile from './pages/AdminProfile'
import Settings from './pages/Settings'
import Landing from './pages/Landing'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken')
  })
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(() => {
    return !!localStorage.getItem('customerToken')
  })

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken')
    const customerToken = localStorage.getItem('customerToken')
    if (adminToken) setIsAdminAuthenticated(true)
    if (customerToken) setIsCustomerAuthenticated(true)
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin setIsAuthenticated={setIsAdminAuthenticated} />} />
        <Route path="/customer/login" element={<CustomerLogin setIsAuthenticated={setIsCustomerAuthenticated} />} />
        
        <Route 
          path="/admin/dashboard" 
          element={isAdminAuthenticated ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customers" 
          element={isAdminAuthenticated ? <Customers /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customers/add" 
          element={isAdminAuthenticated ? <AddCustomer /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/plans" 
          element={isAdminAuthenticated ? <Plans /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/transactions" 
          element={isAdminAuthenticated ? <TransactionHistory /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/send-invoices" 
          element={isAdminAuthenticated ? <SendInvoices /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/addon-bills" 
          element={isAdminAuthenticated ? <AddonBills /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/complaints" 
          element={isAdminAuthenticated ? <Complaints /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/notifications" 
          element={isAdminAuthenticated ? <Notifications /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/reports" 
          element={isAdminAuthenticated ? <Reports /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-campaign" 
          element={isAdminAuthenticated ? <WhatsappCampaign /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-templates" 
          element={isAdminAuthenticated ? <WhatsappTemplates /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/employees" 
          element={isAdminAuthenticated ? <Employees /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customer-distribution" 
          element={isAdminAuthenticated ? <CustomerDistribution /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/data-management" 
          element={isAdminAuthenticated ? <DataManagement /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/connection-requests" 
          element={isAdminAuthenticated ? <ConnectionRequests /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/expenses" 
          element={isAdminAuthenticated ? <Expenses /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/refunds" 
          element={isAdminAuthenticated ? <Refunds /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/deleted-users" 
          element={isAdminAuthenticated ? <DeletedUsers /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/payment-gateways" 
          element={isAdminAuthenticated ? <PaymentGateways /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/profile" 
          element={isAdminAuthenticated ? <AdminProfile /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/settings" 
          element={isAdminAuthenticated ? <Settings /> : <Navigate to="/admin/login" />} 
        />
        
        <Route 
          path="/customer/dashboard" 
          element={isCustomerAuthenticated ? <CustomerDashboard /> : <Navigate to="/customer/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
