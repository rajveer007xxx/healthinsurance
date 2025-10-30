import { useNavigate } from 'react-router-dom'
import { Wifi, Users, CreditCard, BarChart3, Shield, Zap } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ispbilling.in</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/admin/login')}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Admin Login
              </button>
              <button
                onClick={() => navigate('/customer/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Customer Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Complete ISP Billing Solution - Better than PayFast
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Comprehensive ISP billing, customer management, and payment solution with all features and more - ispbilling.in
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Manage all your customers, subscriptions, and connections in one place
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Prepaid & Postpaid Billing</h3>
            <p className="mt-2 text-base text-gray-500">
              Support for both prepaid and postpaid billing with automated invoice generation
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Gateway Integration</h3>
            <p className="mt-2 text-base text-gray-500">
              Easy integration with Razorpay, PayU, Cashfree, and Paytm
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Advanced Reports</h3>
            <p className="mt-2 text-base text-gray-500">
              Comprehensive reporting with revenue tracking and customer analytics
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Super Admin Panel</h3>
            <p className="mt-2 text-base text-gray-500">
              Multi-level admin hierarchy with role-based access control
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <Wifi className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Customer Portal</h3>
            <p className="mt-2 text-base text-gray-500">
              Dedicated portal for customers to manage their account and make payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
