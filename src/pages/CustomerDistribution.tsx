import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import api from '../utils/api'

interface Distribution {
  locality: string
  customer_count: number
  active_count: number
  inactive_count: number
}

export default function CustomerDistribution() {
  const [distribution, setDistribution] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDistribution()
  }, [])

  const fetchDistribution = async () => {
    try {
      const response = await api.get('/customers/distribution/')
      setDistribution(response.data)
    } catch (error) {
      console.error('Error fetching distribution:', error)
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Customer Distribution</h1>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Locality</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Customers</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Inactive</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distribution.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No distribution data found</p>
                  </td>
                </tr>
              ) : (
                distribution.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.locality}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.customer_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{item.active_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{item.inactive_count}</td>
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
