import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import { employeeAPI } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    assignedCustomers: 0,
    todayCollections: 0,
    pendingPayments: 0,
    locationUpdates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await employeeAPI.getAssignedCustomers();
      const customers = response.data;
      
      setStats({
        assignedCustomers: customers.length,
        todayCollections: customers.filter((c: any) => c.last_payment_date === new Date().toISOString().split('T')[0]).length,
        pendingPayments: customers.filter((c: any) => c.status === 'active' && !c.last_payment_date).length,
        locationUpdates: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Assigned Customers',
      value: stats.assignedCustomers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: "Today's Collections",
      value: stats.todayCollections,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: CheckCircle,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Location Updates',
      value: stats.locationUpdates,
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your field work overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/assigned-customers"
              className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">View Assigned Customers</div>
                  <div className="text-sm text-blue-600">See all customers assigned to you</div>
                </div>
              </div>
            </a>
            <a
              href="/collect-payment"
              className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Collect Payment</div>
                  <div className="text-sm text-green-600">Record a new payment collection</div>
                </div>
              </div>
            </a>
            <a
              href="/my-location"
              className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900">Update Location</div>
                  <div className="text-sm text-purple-600">Share your current GPS location</div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Assigned</span>
                <span className="font-bold text-gray-900">{stats.assignedCustomers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Collections Today</span>
                <span className="font-bold text-green-600">{stats.todayCollections}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600">Pending Payments</span>
                <span className="font-bold text-orange-600">{stats.pendingPayments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
