import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import api from '../utils/api'

interface Plan {
  id: number
  plan_name: string
  service_type: string
  speed: string
  data_limit: string
  price: number
  total_amount: number
  validity: string
  status: string
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
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
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Plans Management</h1>
        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Service Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Speed</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Data Limit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Validity</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No plans found
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plan.plan_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plan.service_type || 'BROADBAND'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plan.speed || '50 Mbps'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plan.data_limit || 'Unlimited'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{plan.price || plan.total_amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{plan.total_amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plan.validity || '1 month'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        {plan.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1" title="Edit Plan">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-1" title="Delete Plan">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
