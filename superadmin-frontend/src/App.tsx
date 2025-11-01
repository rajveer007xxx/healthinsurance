import { useState, useEffect } from 'react'
import './App.css'
import { Building2, Users, DollarSign, AlertCircle, Plus, Edit, Trash2, Power, Send, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Admin {
  id: number
  username: string
  email: string
  full_name: string
  phone: string
  is_active: boolean
  created_at: string
  customer_count?: number
  company_name?: string
  company_code?: string
  password?: string
}

interface DashboardStats {
  total_admins: number
  active_admins: number
  inactive_admins: number
  recent_admins: number
  total_customers: number
  active_customers: number
  total_revenue: number
  total_invoices: number
  pending_invoices: number
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'admins' | 'complaints' | 'invoices' | 'payments'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated' | 'expired'>('all')
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_gst: '',
    company_state: '',
    bank_name: '',
    account_number: '',
    branch_ifsc: '',
    declaration: '',
    terms_and_conditions: ''
  })

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardStats()
      fetchAdmins()
    }
  }, [isLoggedIn])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    try {
      const response = await fetch(`${API_URL}/api/superadmin/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        setToken(data.access_token)
        setIsLoggedIn(true)
      } else {
        setLoginError('Invalid credentials')
      }
    } catch (error) {
      setLoginError('Connection error. Please try again.')
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/dashboard/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    }
  }


  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_URL}/api/superadmin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsAddAdminOpen(false)
        fetchAdmins()
        fetchDashboardStats()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create admin:', error)
    }
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmin) return
    
    try {
      const response = await fetch(`${API_URL}/api/superadmin/admins/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsEditAdminOpen(false)
        fetchAdmins()
        fetchDashboardStats()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update admin:', error)
    }
  }

  const handleToggleAdminStatus = async (adminId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/admins/${adminId}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        fetchAdmins()
        fetchDashboardStats()
      }
    } catch (error) {
      console.error('Failed to toggle admin status:', error)
    }
  }

  const handleDeleteAdmin = async (adminId: number) => {
    if (!confirm('Are you sure you want to delete this admin?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/superadmin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        fetchAdmins()
        fetchDashboardStats()
      }
    } catch (error) {
      console.error('Failed to delete admin:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_gst: '',
      company_state: '',
      bank_name: '',
      account_number: '',
      branch_ifsc: '',
      declaration: '',
      terms_and_conditions: ''
    })
  }

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin)
    setFormData({
      full_name: admin.full_name,
      username: admin.username,
      password: admin.password || '',
      email: admin.email,
      phone: admin.phone,
      company_name: admin.company_name || '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_gst: '',
      company_state: '',
      bank_name: '',
      account_number: '',
      branch_ifsc: '',
      declaration: '',
      terms_and_conditions: ''
    })
    setIsEditAdminOpen(true)
  }

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && admin.is_active) ||
                         (statusFilter === 'deactivated' && !admin.is_active)
    return matchesSearch && matchesStatus
  })

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">SuperAdmin Portal</CardTitle>
            <CardDescription className="text-center text-teal-50">
              Manage all admin accounts and operations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                Login to SuperAdmin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8" />
              <span className="text-2xl font-bold">SuperAdmin Portal</span>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-teal-700"
              onClick={() => {
                setIsLoggedIn(false)
                setToken('')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('admins')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'admins'
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Manage Admins</span>
            </button>
            <button
              onClick={() => setCurrentPage('complaints')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'complaints'
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
              <span>Complaints</span>
            </button>
            <button
              onClick={() => setCurrentPage('invoices')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'invoices'
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Send className="h-5 w-5" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => setCurrentPage('payments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'payments'
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              <span>Payments</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Total Admins</span>
                      <Users className="h-8 w-8 opacity-80" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats?.total_admins || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Active Admins</span>
                      <Users className="h-8 w-8 opacity-80" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats?.active_admins || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Inactive Admins</span>
                      <AlertCircle className="h-8 w-8 opacity-80" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats?.inactive_admins || 0}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Total Customers</span>
                      <Users className="h-8 w-8 opacity-80" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">{stats?.total_customers || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentPage === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Manage Admins</h1>
                <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Admin</DialogTitle>
                      <DialogDescription>
                        Add a new admin account with all required details
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name *</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username *</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            value={formData.company_name}
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_phone">Company Phone</Label>
                          <Input
                            id="company_phone"
                            value={formData.company_phone}
                            onChange={(e) => setFormData({...formData, company_phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_email">Company Email</Label>
                          <Input
                            id="company_email"
                            type="email"
                            value={formData.company_email}
                            onChange={(e) => setFormData({...formData, company_email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_gst">Company GST</Label>
                          <Input
                            id="company_gst"
                            value={formData.company_gst}
                            onChange={(e) => setFormData({...formData, company_gst: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_state">Company State</Label>
                          <Input
                            id="company_state"
                            value={formData.company_state}
                            onChange={(e) => setFormData({...formData, company_state: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={formData.bank_name}
                            onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account_number">Account Number</Label>
                          <Input
                            id="account_number"
                            value={formData.account_number}
                            onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="branch_ifsc">Branch IFSC</Label>
                          <Input
                            id="branch_ifsc"
                            value={formData.branch_ifsc}
                            onChange={(e) => setFormData({...formData, branch_ifsc: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_address">Company Address</Label>
                        <Textarea
                          id="company_address"
                          value={formData.company_address}
                          onChange={(e) => setFormData({...formData, company_address: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terms_and_conditions">Terms and Conditions *</Label>
                        <Textarea
                          id="terms_and_conditions"
                          value={formData.terms_and_conditions}
                          onChange={(e) => setFormData({...formData, terms_and_conditions: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="declaration">Declaration *</Label>
                        <Textarea
                          id="declaration"
                          value={formData.declaration}
                          onChange={(e) => setFormData({...formData, declaration: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                          Create Admin
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, username, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-48">
                      <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active Only</SelectItem>
                          <SelectItem value="deactivated">Inactive Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-semibold">Name</th>
                          <th className="text-left p-4 font-semibold">Username</th>
                          <th className="text-left p-4 font-semibold">Email</th>
                          <th className="text-left p-4 font-semibold">Phone</th>
                          <th className="text-left p-4 font-semibold">Company</th>
                          <th className="text-left p-4 font-semibold">Customers</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.map((admin) => (
                          <tr key={admin.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{admin.full_name}</td>
                            <td className="p-4">{admin.username}</td>
                            <td className="p-4">{admin.email}</td>
                            <td className="p-4">{admin.phone}</td>
                            <td className="p-4">{admin.company_name || '-'}</td>
                            <td className="p-4">{admin.customer_count || 0}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                admin.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {admin.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditDialog(admin)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleAdminStatus(admin.id)}
                                  className={admin.is_active ? '' : 'text-green-600'}
                                >
                                  <Power className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredAdmins.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No admins found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
                <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Admin</DialogTitle>
                    <DialogDescription>
                      Update admin account details
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateAdmin} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_full_name">Full Name</Label>
                        <Input
                          id="edit_full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_username">Username (Read-only)</Label>
                        <Input
                          id="edit_username"
                          value={formData.username}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_email">Email</Label>
                        <Input
                          id="edit_email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_phone">Phone</Label>
                        <Input
                          id="edit_phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_password">New Password (leave empty to keep current)</Label>
                        <Input
                          id="edit_password"
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Leave empty to keep current password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditAdminOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                        Update Admin
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {currentPage === 'complaints' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No complaints at this time</p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'invoices' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No invoices available</p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPage === 'payments' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No payments recorded</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
