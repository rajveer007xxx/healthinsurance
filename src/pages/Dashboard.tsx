import React, { useEffect, useState } from 'react'
import { Users, DollarSign, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import api from '../utils/api'

interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  broadbandCustomers: number
  cableTvCustomers: number
  deactiveCustomers: number
  suspendedCustomers: number
  todaysCollection: number
  todaysPaymentCount: number
  monthsCollection: number
  monthsPaymentCount: number
  totalDues: number
  todaysExpiry: number
  next3DaysExpiry: number
  todaysRecharged: number
  monthsComplaints: number
  monthsEnrollments: number
  onlinePaymentsMonth: number
}

interface RevenueData {
  month: string
  revenue: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, revenueResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue')
      ])
      setStats(statsResponse.data)
      setRevenueData(revenueResponse.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  const statCards = [
    { 
      label: 'Total Customers', 
      value: stats?.totalCustomers || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      subtext: null
    },
    { 
      label: 'Active Customers', 
      value: stats?.activeCustomers || 0, 
      icon: Users, 
      color: 'bg-green-500',
      subtext: null
    },
    { 
      label: 'Broadband Customers', 
      value: stats?.broadbandCustomers || 0, 
      icon: Users, 
      color: 'bg-cyan-500',
      subtext: null
    },
    { 
      label: 'Cable TV Customers', 
      value: stats?.cableTvCustomers || 0, 
      icon: Users, 
      color: 'bg-pink-500',
      subtext: null
    },
    { 
      label: 'Deactive Customers', 
      value: stats?.deactiveCustomers || 0, 
      icon: Users, 
      color: 'bg-blue-400',
      subtext: null
    },
    { 
      label: 'Suspended Customers', 
      value: stats?.suspendedCustomers || 0, 
      icon: Users, 
      color: 'bg-orange-500',
      subtext: null
    },
    { 
      label: "Today's Collection", 
      value: `₹${stats?.todaysCollection || 0}`, 
      icon: DollarSign, 
      color: 'bg-purple-500',
      subtext: `${stats?.todaysPaymentCount || 0} payments`
    },
    { 
      label: "Month's Collection", 
      value: `₹${stats?.monthsCollection || 0}`, 
      icon: DollarSign, 
      color: 'bg-purple-600',
      subtext: `${stats?.monthsPaymentCount || 0} payments`
    },
    { 
      label: 'Total Dues', 
      value: `₹${stats?.totalDues || 0}`, 
      icon: FileText, 
      color: 'bg-red-500',
      subtext: null
    },
    { 
      label: "Today's Expiry", 
      value: stats?.todaysExpiry || 0, 
      icon: Clock, 
      color: 'bg-yellow-500',
      subtext: null
    },
    { 
      label: 'Next 3 Days Expiry', 
      value: stats?.next3DaysExpiry || 0, 
      icon: Clock, 
      color: 'bg-orange-400',
      subtext: null
    },
    { 
      label: "Today's Recharged", 
      value: stats?.todaysRecharged || 0, 
      icon: TrendingUp, 
      color: 'bg-green-600',
      subtext: null
    },
    { 
      label: "Month's Complaints", 
      value: stats?.monthsComplaints || 0, 
      icon: AlertCircle, 
      color: 'bg-red-600',
      subtext: null
    },
    { 
      label: "Month's Enrollments", 
      value: stats?.monthsEnrollments || 0, 
      icon: Users, 
      color: 'bg-blue-600',
      subtext: null
    },
    { 
      label: 'Online Payments (Month)', 
      value: stats?.onlinePaymentsMonth || 0, 
      icon: DollarSign, 
      color: 'bg-teal-500',
      subtext: null
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your ISP management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">{card.label}</h3>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  {card.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
                  )}
                </div>
                <div className={`${card.color} p-4 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</h2>
        <div className="h-64 flex items-end justify-around space-x-2">
          {revenueData.length > 0 ? (
            revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-isp-teal rounded-t"
                  style={{ height: `${(data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100}%` }}
                />
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs font-semibold text-gray-800">₹{data.revenue}</span>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
