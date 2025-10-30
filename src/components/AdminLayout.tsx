import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Package, FileText, CreditCard, Settings, LogOut, History, Receipt, AlertCircle, HeadphonesIcon, Bell, MessageCircleIcon, FileTextIcon, BarChart3, UsersIcon, UserPlus, Database, Mail, SettingsIcon, BookOpen, ClipboardList, Wallet, RefreshCw, Trash2, MessageSquareText, UserCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../utils/api'
import { useSessionTimeout } from '../hooks/useSessionTimeout'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [adminName, setAdminName] = useState('Admin')
  const [profileImage, setProfileImage] = useState('')
  const [companyName, setCompanyName] = useState('FIBERNET INTERNET')
  const [companyCode, setCompanyCode] = useState('17558933')
  const [companyLogo, setCompanyLogo] = useState('')
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const { showWarning, extendSession, logout } = useSessionTimeout()

  useEffect(() => {
    fetchAdminProfile()
    fetchSettings()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return
      
      const response = await api.get('/auth/me')
      setAdminName(response.data.full_name || response.data.username || 'Admin')
      setProfileImage(response.data.profile_image || '')
    } catch (error) {
      console.error('Error fetching admin profile:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/')
      if (response.data) {
        setCompanyName(response.data.company_name || 'FIBERNET INTERNET')
        setCompanyCode(response.data.company_code || '17558933')
        setCompanyLogo(response.data.company_logo || '')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/customers', icon: Users, label: 'Userlist' },
    { path: '/admin/plans', icon: Package, label: 'Plans' },
    { path: '/admin/transactions', icon: History, label: 'Payment History' },
    { path: '/admin/send-invoices', icon: Receipt, label: 'Send Manual Invoice' },
    { path: '/admin/addon-bills', icon: Mail, label: 'Addon Bills' },
    { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints List' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/whatsapp-campaign', icon: MessageCircleIcon, label: 'Whatsapp Campaign' },
    { path: '/admin/whatsapp-templates', icon: FileTextIcon, label: 'Whatsapp Templates' },
    { path: '/admin/employees', icon: UsersIcon, label: 'Employee Management' },
    { path: '/admin/customer-distribution', icon: UserPlus, label: 'Customer Distribution' },
    { path: '/admin/data-management', icon: Database, label: 'Data Management' },
    { path: '/admin/connection-requests', icon: ClipboardList, label: 'Connection Request' },
    { path: '/admin/expenses', icon: Wallet, label: 'Expense List' },
    { path: '/admin/refunds', icon: RefreshCw, label: 'Refund List' },
    { path: '/admin/deleted-users', icon: Trash2, label: 'Deleted Users' },
    { path: '/admin/payment-gateways', icon: Settings, label: 'Payment Gateways' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white sticky top-0 z-50" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderBottom: '1px solid #000' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#448996]">
                  {companyName}
                </span>
                {companyCode && (
                  <span className="text-xs font-normal text-[#448996]">
                    Company ID: {companyCode}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 "
              >
                {profileImage ? (
                  <img 
                    src={`http://82.29.162.153:8002${profileImage}`} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
                <span>{adminName}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white  shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/admin/profile')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      navigate('/admin/settings')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        <aside className={`${sidebarMinimized ? 'w-20' : 'w-64'} bg-[#448996] shadow-sm transition-all duration-300 flex flex-col h-screen sticky top-0`}>
          <div className="bg-white z-10 p-2 flex justify-between items-center border-b border-gray-300">
            {!sidebarMinimized && companyLogo && (
              <img 
                src={`http://82.29.162.153:8002${companyLogo}`} 
                alt="Company Logo" 
                className="h-10 w-40 object-contain"
              />
            )}
            {!sidebarMinimized && !companyLogo && (
              <span className="text-gray-900 font-bold text-sm">{companyName}</span>
            )}
            {sidebarMinimized && <div></div>}
            <button
              onClick={() => setSidebarMinimized(!sidebarMinimized)}
              className="p-2  hover:bg-gray-100 text-gray-700"
              title={sidebarMinimized ? 'Maximize Sidebar' : 'Minimize Sidebar'}
            >
              {sidebarMinimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          <nav className="px-2 py-2 overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center ${sidebarMinimized ? 'justify-center px-2' : 'px-3'} py-2 text-sm font-medium border border-[#336677] mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00A0A0] text-white font-bold'
                      : 'text-white hover:bg-[#00A0A0] hover:scale-105'
                  }`}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 ${sidebarMinimized ? '' : 'mr-2 flex-shrink-0'}`} />
                  {!sidebarMinimized && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Session Timeout Warning</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Your session will expire in 30 seconds due to inactivity. You will be automatically logged out.
            </p>
            <div className="flex gap-3">
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white  hover:bg-indigo-700 font-medium"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700  hover:bg-gray-300 font-medium"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
