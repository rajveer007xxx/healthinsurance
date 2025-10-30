import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import api from '../utils/api'

interface Refund {
  id: number
  customer_name: string
  amount: number
  reason: string
  status: string
  requested_date: string
  processed_date?: string
}

export default function RefundList() {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const response = await api.get('/refunds/')
      setRefunds(response.data)
    } catch (error) {
      console.error('Error fetching refunds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (refundId: number) => {
    try {
      await api.patch(`/refunds/${refundId}/approve`)
      fetchRefunds()
      alert('Refund approved successfully')
    } catch (error) {
      console.error('Error approving refund:', error)
      alert('Failed to approve refund')
    }
  }

  const handleReject = async (refundId: number) => {
    try {
      await api.patch(`/refunds/${refundId}/reject`)
      fetchRefunds()
      alert('Refund rejected')
    } catch (error) {
      console.error('Error rejecting refund:', error)
      alert('Failed to reject refund')
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
        <h1 className="text-2xl font-bold text-gray-900">Refund List</h1>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-pink-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Requested Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Processed Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No refunds found
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{refund.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{refund.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{refund.reason}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        refund.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        refund.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{refund.requested_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{refund.processed_date || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {refund.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApprove(refund.id)}
                            className="text-green-600 hover:text-green-800 p-1" 
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(refund.id)}
                            className="text-red-600 hover:text-red-800 p-1" 
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
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
