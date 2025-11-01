import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  CreditCard,
  FileText,
  AlertCircle,
  MapPin,
  Settings as SettingsIcon,
  LogOut,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Layout({ setIsAuthenticated }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/customers/add', icon: UserPlus, label: 'Add Customer' },
    { path: '/employees', icon: Briefcase, label: 'Employees' },
    { path: '/plans', icon: FileText, label: 'Plans' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/invoices', icon: FileText, label: 'Invoices' },
    { path: '/complaints', icon: AlertCircle, label: 'Complaints' },
    { path: '/track-employee', icon: MapPin, label: 'Track Employee' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white shadow-xl">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wifi className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ISP Admin</h1>
              <p className="text-xs text-white/80">Billing System</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
