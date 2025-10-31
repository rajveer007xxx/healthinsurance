import AdminLayout from '../components/AdminLayout'
import { useNavigate } from 'react-router-dom'
import { Construction } from 'lucide-react'

export default function AddonBills() {
  const navigate = useNavigate()

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-purple-100 rounded-full p-6">
                <Construction className="h-16 w-16 text-purple-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚧 Page Under Construction 🚧
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're working hard to bring you this feature!
          </p>
          
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-900 font-medium mb-1">
              Please Visit Again Soon
            </p>
            <p className="text-xs text-purple-700">
              This page is currently being developed and will be available shortly.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-2 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
            >
              Dashboard
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            Thank you for your patience! 🙏
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
