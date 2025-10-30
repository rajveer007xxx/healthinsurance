import { useNavigate } from 'react-router-dom'
import { Construction } from 'lucide-react'

export default function UnderConstruction() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-purple-100">
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full mx-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 rounded-full p-6">
            <Construction className="h-16 w-16 text-purple-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          🚧 Page Under Construction 🚧
        </h1>
        
        <p className="text-gray-600 font-medium mb-6">
          We're working hard to bring you this feature!
        </p>
        
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <p className="text-purple-800 font-medium mb-1">Please Visit Again Soon</p>
          <p className="text-purple-600 text-sm">
            This page is currently being developed and will be available shortly.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 font-medium hover:bg-purple-50 transition-colors"
          >
            Dashboard
          </button>
        </div>
        
        <p className="mt-6 text-gray-500 text-sm">
          Thank you for your patience! 🙏
        </p>
      </div>
    </div>
  )
}
