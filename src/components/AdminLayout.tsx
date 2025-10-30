import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  History,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  BarChart3,
  MessageCircle,
  FileCode,
  UserCog,
  MapPin,
  Database,
  UserPlus,
  Receipt,
  RotateCcw,
  Trash2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/userlist', icon: Users, label: 'Userlist' },
    { path: '/admin/plans', icon: Package, label: 'Plans' },
    { path: '/admin/transactions', icon: History, label: 'Payment History' },
    { path: '/admin/send-invoices', icon: FileText, label: 'Send Manual Invoice' },
    { path: '/admin/addon-bills', icon: CreditCard, label: 'Addon Bills' },
    { path: '/admin/complaints', icon: MessageSquare, label: 'Complaints List' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/whatsapp-campaign', icon: MessageCircle, label: 'Whatsapp Campaign' },
    { path: '/admin/whatsapp-templates', icon: FileCode, label: 'Whatsapp Templates' },
    { path: '/admin/employee-management', icon: UserCog, label: 'Employee Management' },
    { path: '/admin/customer-distribution', icon: MapPin, label: 'Customer Distribution' },
    { path: '/admin/data-management', icon: Database, label: 'Data Management' },
    { path: '/admin/connection-request', icon: UserPlus, label: 'Connection Request' },
    { path: '/admin/expense-list', icon: Receipt, label: 'Expense List' },
    { path: '/admin/refund-list', icon: RotateCcw, label: 'Refund List' },
    { path: '/admin/deleted-users', icon: Trash2, label: 'Deleted Users' },
    { path: '/admin/payment-gateways', icon: Wallet, label: 'Payment Gateways' }
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleProfile = () => {
    navigate('/admin/profile')
    setShowProfileMenu(false)
  }

  const handleSettings = () => {
    navigate('/admin/settings')
    setShowProfileMenu(false)
  }

  const companyName = 'FIBERNET INTERNET'
  const companyId = 'Company ID: 17558933'
  const adminName = localStorage.getItem('adminName') || 'RAJVEER SINGH'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-isp-teal text-white transition-all duration-300 flex flex-col ${
          isSidebarMinimized ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between border-b border-isp-border">
          {!isSidebarMinimized && (
            <img
              src="http://82.29.162.153:8002/uploads/logo_821e1ed2-d5f0-4e4a-8c7f-0e3b5f8a9c1d.png"
              alt="Company Logo"
              className="h-12 w-auto"
            />
          )}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-1 hover:bg-isp-accent rounded transition-colors"
            title={isSidebarMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
          >
            {isSidebarMinimized ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-isp-accent text-white font-semibold'
                    : 'text-white hover:bg-isp-accent/50'
                }`}
                title={isSidebarMinimized ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarMinimized && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-isp-teal">{companyName}</h2>
            <p className="text-sm text-gray-500">{companyId}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">{adminName}</span>
              <ChevronRight
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  showProfileMenu ? 'rotate-90' : ''
                }`}
              />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleSettings}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <UserCog className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
