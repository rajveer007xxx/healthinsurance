import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, UserMinus, DollarSign, TrendingUp, AlertCircle, Clock, Calendar, RefreshCw, AlertTriangle, UserPlus, CreditCard, BarChart3 } from 'lucide-react'
import api from '../utils/api'

interface DashboardStats {
  total_customers: number
  active_customers: number
  deactive_customers: number
  suspended_customers: number
  today_collection: number
  today_collection_count: number
  month_collection: number
  month_collection_count: number
  total_dues: number
  today_expiry: number
  next_3days_expiry: number
  today_recharged: number
  month_complaints: number
  month_enrollments: number
  online_payments: number
  broadband_customers?: number
  cable_tv_customers?: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
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
    online_payments: 0,
    broadband_customers: 0,
    cable_tv_customers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total_customers || 0,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Customers',
      value: stats.active_customers || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Broadband Customers',
      value: stats.broadband_customers || stats.active_customers || 0,
      icon: Users,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
    },
    {
      title: 'Cable TV Customers',
      value: stats.cable_tv_customers || 0,
      icon: Users,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
    },
    {
      title: 'Deactive Customers',
      value: stats.deactive_customers || 0,
      icon: UserX,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Suspended Customers',
      value: stats.suspended_customers || 0,
      icon: UserMinus,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: "Today's Collection",
      value: `₹${(stats.today_collection || 0).toLocaleString()}`,
      subtitle: `${stats.today_collection_count || 0} payments`,
      icon: DollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: "Month's Collection",
      value: `₹${(stats.month_collection || 0).toLocaleString()}`,
      subtitle: `${stats.month_collection_count || 0} payments`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Dues',
      value: `₹${(stats.total_dues || 0).toLocaleString()}`,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      title: "Today's Expiry",
      value: stats.today_expiry || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Next 3 Days Expiry',
      value: stats.next_3days_expiry || 0,
      icon: Calendar,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: "Today's Recharged",
      value: stats.today_recharged || 0,
      icon: RefreshCw,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: "Month's Complaints",
      value: stats.month_complaints || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      title: "Month's Enrollments",
      value: stats.month_enrollments || 0,
      icon: UserPlus,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Online Payments (Month)',
      value: stats.online_payments || 0,
      icon: CreditCard,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your ISP management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`${card.color} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <BarChart3 className="h-12 w-12 mr-2" />
            <span>Chart will be displayed here</span>
          </div>
        </div>
      </div>
    </div>
  )
}
