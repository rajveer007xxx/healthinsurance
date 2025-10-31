import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import api from '../utils/api'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  email?: string
  balance: number
}

interface SendPaymentLinkModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess: () => void
}

export default function SendPaymentLinkModal({ isOpen, onClose, customer, onSuccess }: SendPaymentLinkModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_id: '',
    total_due: 0,
    discount: 0,
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      const defaultMessage = `Dear ${customer.full_name},\n\nYour Total Due amount is: ₹${Math.round(customer.balance)}.\n\nPlease Pay to Cash Collection Agents or to make Payment online please use this link: [Payment Link will be generated]`
      
      setFormData({
        customer_name: customer.full_name,
        customer_id: customer.customer_id,
        total_due: customer.balance,
        discount: 0,
        message: defaultMessage
      })
      setError('')
    }
  }, [isOpen, customer])

  useEffect(() => {
    if (customer) {
      const amountAfterDiscount = formData.total_due - formData.discount
      const defaultMessage = `Dear ${customer.full_name},\n\nYour Total Due amount is: ₹${Math.round(formData.total_due)}.\n${formData.discount > 0 ? `Discount: ₹${Math.round(formData.discount)}\n` : ''}${formData.discount > 0 ? `Amount after discount: ₹${Math.round(amountAfterDiscount)}\n\n` : '\n'}Please Pay to Cash Collection Agents or to make Payment online please use this link: [Payment Link will be generated]`
      
      setFormData(prev => ({
        ...prev,
        message: defaultMessage
      }))
    }
  }, [formData.discount, formData.total_due])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customer) return
    
    if (!customer.email) {
      setError('Customer email is not available')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post(`/customers/${customer.id}/send-payment-link`, {
        amount: formData.total_due,
        discount: formData.discount,
        message: formData.message
      })
      
      alert('Payment link sent successfully to customer email!')
      onSuccess()
      onClose()
    } catch (err: any) {
      if (err.response?.status === 422 || err.response?.status === 404) {
        try {
          await api.post(`/customers/${customer.id}/send-payment-link`)
          alert('Payment link sent successfully to customer email!')
          onSuccess()
          onClose()
        } catch (fallbackErr: any) {
          setError(fallbackErr.response?.data?.detail || 'Failed to send payment link')
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to send payment link')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Send Payment Link</h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customer_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Due Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_due}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_due: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter message to customer"
              />
            </div>

            {customer.email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email will be sent to:</span> {customer.email}
                </p>
              </div>
            )}

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
                <Send className="h-4 w-4" />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
