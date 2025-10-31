import { useState, useEffect } from 'react'
import { X, DollarSign } from 'lucide-react'
import api from '../utils/api'
import { generatePaymentId } from '../utils/constants'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  balance: number
}

interface CollectPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess: () => void
}

export default function CollectPaymentModal({ isOpen, onClose, customer, onSuccess }: CollectPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    discount: 0,
    payment_method: 'CASH',
    payment_id: '',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        amount: customer.balance?.toString() || '',
        discount: 0,
        payment_method: 'CASH',
        payment_id: generatePaymentId('CASH'),
        remarks: ''
      })
      setError('')
    }
  }, [isOpen, customer])

  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method,
      payment_id: generatePaymentId(method)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customer) return
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/payments/', {
        customer_id: customer.id,
        amount: parseFloat(formData.amount),
        discount: parseFloat(formData.discount.toString()) || 0,
        payment_method: formData.payment_method,
        payment_id: formData.payment_id,
        remarks: formData.remarks
      })
      
      alert('Payment collected successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to collect payment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Collect Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Customer ID:</span> {customer.customer_id}</p>
              <p><span className="font-medium">Name:</span> {customer.full_name}</p>
              <p><span className="font-medium">Mobile:</span> {customer.mobile}</p>
              <p><span className="font-medium">Outstanding Balance:</span> <span className="text-red-600 font-bold">₹{customer.balance}</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter discount amount (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment ID
              </label>
              <input
                type="text"
                value={formData.payment_id}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter any remarks (optional)"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <DollarSign className="h-4 w-4" />
                {loading ? 'Collecting...' : 'Collect Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
