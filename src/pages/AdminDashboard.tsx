import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { Users, DollarSign, FileText, AlertCircle, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    deactive_customers: 0,
    suspended_customers: 0,
    today_collection: 0,
    today_collection_count: 0,
    month_collection: 0,
    month_collection_count: 0,
    total_dues: 0,
    today_expiry: 0,
    next_3days_expiry: 0,
    today_recharged: 0,
    month_complaints: 0,
    month_enrollments: 0,
    inactive_customers: 0,
    online_payments: 0,
    broadband_customers: 0,
    cable_tv_customers: 0,
  })
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue'),
      ])
      setStats(statsRes.data)
      setRevenueData(revenueRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total_customers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Customers',
      value: stats.active_customers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Broadband Customers',
      value: stats.broadband_customers,
      icon: Users,
      color: 'bg-cyan-500',
    },
    {
      title: 'Cable TV Customers',
      value: stats.cable_tv_customers,
      icon: Users,
      color: 'bg-pink-500',
    },
    {
      title: 'Deactive Customers',
      value: stats.deactive_customers,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white0',
    },
    {
      title: 'Suspended Customers',
      value: stats.suspended_customers,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: "Today's Collection",
      value: `₹${Math.round(stats.today_collection).toLocaleString()}`,
      subtitle: `${stats.today_collection_count} payments`,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
    {
      title: "Month's Collection",
      value: `₹${Math.round(stats.month_collection).toLocaleString()}`,
      subtitle: `${stats.month_collection_count} payments`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Dues',
      value: `₹${Math.round(stats.total_dues).toLocaleString()}`,
      icon: FileText,
      color: 'bg-red-500',
    },
    {
      title: "Today's Expiry",
      value: stats.today_expiry,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
    {
      title: 'Next 3 Days Expiry',
      value: stats.next_3days_expiry,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      title: "Today's Recharged",
      value: stats.today_recharged,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: "Month's Complaints",
      value: stats.month_complaints,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      title: "Month's Enrollments",
      value: stats.month_enrollments,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Online Payments (Month)',
      value: stats.online_payments,
      icon: DollarSign,
      color: 'bg-teal-500',
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Welcome to your ISP management dashboard</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="bg-white  shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`${stat.color} rounded-full p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white  shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  )
}
