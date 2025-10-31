import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../utils/api'
import { generatePaymentId } from '../utils/constants'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  balance: number
  plan_amount: number
}

export default function CollectPayment() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CASH',
    payment_id: '',
    remarks: ''
  })

  useEffect(() => {
    if (id) {
      fetchCustomer()
    }
  }, [id])

  useEffect(() => {
    if (formData.payment_method) {
      const paymentId = generatePaymentId(formData.payment_method)
      setFormData(prev => ({ ...prev, payment_id: paymentId }))
    }
  }, [formData.payment_method])

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`)
      setCustomer(response.data)
      setFormData(prev => ({ ...prev, amount: response.data.balance.toString() }))
    } catch (error) {
      console.error('Error fetching customer:', error)
      alert('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/payments/', {
        customer_id: id,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        payment_id: formData.payment_id,
        remarks: formData.remarks || null
      })
      alert('Payment collected successfully!')
      navigate('/admin/customers')
    } catch (error) {
      console.error('Error collecting payment:', error)
      alert('Failed to collect payment')
    } finally {
      setSubmitting(false)
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
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Collect Payment</h1>
      </div>

      {customer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Customer ID:</span>
              <span className="ml-2 text-blue-900">{customer.customer_id}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Name:</span>
              <span className="ml-2 text-blue-900">{customer.full_name}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Mobile:</span>
              <span className="ml-2 text-blue-900">{customer.mobile}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Outstanding Balance:</span>
              <span className="ml-2 text-blue-900 font-bold">₹{customer.balance}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CASH">Cash</option>
              <option value="PHONEPE">PhonePe</option>
              <option value="PAYTM">Paytm</option>
              <option value="GOOGLEPAY">Google Pay</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment ID
            </label>
            <input
              type="text"
              value={formData.payment_id}
              onChange={(e) => setFormData({ ...formData, payment_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated payment ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any remarks (optional)"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/customers')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {submitting ? 'Processing...' : 'Collect Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
