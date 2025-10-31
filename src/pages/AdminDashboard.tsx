import { LogOut, User, Users, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-xs text-blue-100">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-blue-700 rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-2">Welcome, {user.full_name}!</h3>
            <p className="text-blue-100">Manage your ISP business from anywhere</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-gray-600">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="mx-auto mb-2 text-green-600" size={32} />
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-gray-600">Active Employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users size={24} />
              <span className="text-xs">Customers</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <User size={24} />
              <span className="text-xs">Employees</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MapPin size={24} />
              <span className="text-xs">Track Employees</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <SettingsIcon size={24} />
              <span className="text-xs">Settings</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center py-4">
              No recent activity to display
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
