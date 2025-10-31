import { useEffect, useState } from 'react'
import { CreditCard, ToggleLeft, ToggleRight, Edit } from 'lucide-react'
import api from '../utils/api'

interface PaymentGateway {
  id: number
  gateway_name: string
  api_key: string
  status: string
  transaction_fee: number
  supported_methods: string[]
}

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const response = await api.get('/payment-gateways/')
      setGateways(response.data)
    } catch (error) {
      console.error('Error fetching gateways:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (gatewayId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
    try {
      await api.patch(`/payment-gateways/${gatewayId}/status`, { status: newStatus })
      setGateways(gateways.map(g => 
        g.id === gatewayId ? { ...g, status: newStatus } : g
      ))
      alert(`Gateway ${newStatus.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Error toggling gateway status:', error)
      alert('Failed to update gateway status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.length === 0 ? (
          <div className="col-span-2 bg-white rounded shadow p-8 text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No payment gateways configured</p>
          </div>
        ) : (
          gateways.map((gateway) => (
            <div key={gateway.id} className="bg-white rounded shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{gateway.gateway_name}</h3>
                  <p className="text-sm text-gray-500">Transaction Fee: {gateway.transaction_fee}%</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded ${
                  gateway.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {gateway.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">API Key:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {gateway.api_key.substring(0, 20)}...
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Supported Methods:</p>
                <div className="flex flex-wrap gap-2">
                  {gateway.supported_methods.map((method, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {method}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(gateway.id, gateway.status)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded ${
                    gateway.status === 'Active' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {gateway.status === 'Active' ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {gateway.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
