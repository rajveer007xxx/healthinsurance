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
import Invoices from './pages/SendInvoiceList'
import Payments from './pages/Payments'
import Complaints from './pages/Complaints'
import PaymentGateways from './pages/PaymentGateways'
import AdminProfile from './pages/AdminProfile'
import Settings from './pages/Settings'
import Localities from './pages/Localities'
import Companies from './pages/Companies'
import Landing from './pages/Landing'
import BillDues from './pages/BillDues'
import UnderConstruction from './components/UnderConstruction'

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
          path="/admin/bill-dues" 
          element={isAdminAuthenticated ? <BillDues /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/transactions" 
          element={isAdminAuthenticated ? <TransactionHistory /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/plans" 
          element={isAdminAuthenticated ? <Plans /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/send-invoices" 
          element={isAdminAuthenticated ? <Invoices /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/addon-bills" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/payments" 
          element={isAdminAuthenticated ? <Payments /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/complaints" 
          element={isAdminAuthenticated ? <Complaints /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/notifications" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/reports" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-campaign" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/whatsapp-templates" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/employees" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/customer-distribution" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/data-management" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/connection-requests" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/expenses" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/refunds" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/deleted-users" 
          element={isAdminAuthenticated ? <UnderConstruction /> : <Navigate to="/admin/login" />} 
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
          path="/admin/localities" 
          element={isAdminAuthenticated ? <Localities /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/companies" 
          element={isAdminAuthenticated ? <Companies /> : <Navigate to="/admin/login" />} 
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
