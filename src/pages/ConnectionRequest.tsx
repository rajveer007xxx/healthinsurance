import { useEffect, useState } from 'react'
import { Check, X, Eye } from 'lucide-react'
import api from '../utils/api'

interface ConnectionRequest {
  id: number
  customer_name: string
  phone: string
  email: string
  address: string
  plan_requested: string
  status: string
  requested_date: string
}

export default function ConnectionRequest() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get('/connection-requests/')
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      await api.patch(`/connection-requests/${requestId}/approve`)
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: 'Approved' } : r
      ))
      alert('Request approved successfully')
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await api.patch(`/connection-requests/${requestId}/reject`)
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: 'Rejected' } : r
      ))
      alert('Request rejected')
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request')
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
        <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-orange-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Requested Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No connection requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{request.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.plan_requested}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.requested_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {request.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-800 p-1" 
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-800 p-1" 
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1" 
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
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
