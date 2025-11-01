import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CreditCard, MessageSquare, Wifi } from 'lucide-react';
import { customerAPI } from '../utils/api';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalPayments: 0,
    openComplaints: 0,
    connectionStatus: 'active',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, invoicesRes, paymentsRes, complaintsRes] = await Promise.all([
        customerAPI.getProfile(),
        customerAPI.getInvoices(),
        customerAPI.getPayments(),
        customerAPI.getComplaints(),
      ]);

      setProfile(profileRes.data);
      setStats({
        totalInvoices: invoicesRes.data.length,
        totalPayments: paymentsRes.data.length,
        openComplaints: complaintsRes.data.filter((c: any) => c.status === 'open').length,
        connectionStatus: profileRes.data.status || 'active',
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Open Complaints',
      value: stats.openComplaints,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Connection Status',
      value: stats.connectionStatus,
      icon: Wifi,
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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.name || 'Customer'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your account overview</p>
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
                  <div className="text-3xl font-bold text-gray-900">
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </div>
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
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{profile?.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">{profile?.phone}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Current Plan</span>
              <span className="font-medium text-gray-900">{profile?.plan_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${
                profile?.status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {profile?.status || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/invoices"
              className="block p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">View Invoices</div>
                  <div className="text-sm text-blue-600">Check your billing history</div>
                </div>
              </div>
            </a>
            <a
              href="/payments"
              className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">View Payments</div>
                  <div className="text-sm text-green-600">Track your payment history</div>
                </div>
              </div>
            </a>
            <a
              href="/complaints"
              className="block p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-orange-900">Submit Complaint</div>
                  <div className="text-sm text-orange-600">Report an issue or concern</div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
