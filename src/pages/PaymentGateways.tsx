import AdminLayout from '../components/AdminLayout'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Plus } from 'lucide-react'

export default function PaymentGateways() {
  const [gateways, setGateways] = useState([])

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const response = await api.get('/payments/gateways')
      setGateways(response.data)
    } catch (error) {
      console.error('Error fetching gateways:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateways</h1>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Gateway
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gateways.map((gateway: any) => (
            <div key={gateway.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{gateway.gateway_name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Merchant ID: {gateway.merchant_id}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  gateway.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {gateway.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  gateway.is_test_mode ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {gateway.is_test_mode ? 'Test Mode' : 'Production Mode'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
