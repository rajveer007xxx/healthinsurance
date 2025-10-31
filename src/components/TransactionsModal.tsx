import { useState, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import api from '../utils/api'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
}

interface Transaction {
  id: number
  transaction_id: string
  transaction_date: string
  amount: number
  balance_after: number
  description: string
  collected_by: number | null
  collector_name: string | null
}

interface TransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

export default function TransactionsModal({ isOpen, onClose, customer }: TransactionsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      fetchTransactions()
    }
  }, [isOpen, customer])

  const fetchTransactions = async () => {
    if (!customer) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await api.get(`/transactions/?customer_id=${customer.id}`)
      setTransactions(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><span className="font-medium">Customer ID:</span> {customer.customer_id}</p>
                <p><span className="font-medium">Name:</span> {customer.full_name}</p>
              </div>
              <div>
                <p><span className="font-medium">Mobile:</span> {customer.mobile}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No transactions found for this customer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Collector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Due
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      After Payment Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => {
                    const discountMatch = transaction.description?.match(/Discount:\s*₹?([\d.]+)/)
                    const discount = discountMatch ? parseFloat(discountMatch[1]) : 0
                    
                    const totalDue = transaction.balance_after + transaction.amount + discount
                    
                    const methodMatch = transaction.description?.match(/Payment received via (\w+)/)
                    const paymentMethod = methodMatch ? methodMatch[1] : 'N/A'
                    
                    const paymentMethodDisplay = discount > 0 
                      ? `${paymentMethod} (Discount: ₹${discount.toFixed(2)})`
                      : paymentMethod
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transaction_date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.transaction_id || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.collector_name || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {paymentMethodDisplay}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{totalDue.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{transaction.balance_after.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {transaction.description || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
