import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import { generatePaymentId } from '../utils/constants'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  plan_id?: number
  plan_name?: string
  expiry_date?: string
  state?: string
}

interface Plan {
  id: number
  plan_name: string
  plan_amount: number
}

interface Settings {
  company_state: string
}

interface RenewSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess: () => void
}

export default function RenewSubscriptionModal({ isOpen, onClose, customer, onSuccess }: RenewSubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [formData, setFormData] = useState({
    plan_id: '',
    period_months: 1,
    start_date: '',
    end_date: '',
    plan_amount: 0,
    discount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total_bill_amount: 0,
    amount_paid: 0,
    balance: 0,
    payment_method: 'CASH',
    payment_id: '',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      fetchPlans()
      fetchSettings()
      
      const today = new Date()
      const startDate = customer.expiry_date ? new Date(customer.expiry_date) : today
      if (startDate < today) {
        startDate.setTime(today.getTime())
      }
      
      setFormData({
        plan_id: customer.plan_id?.toString() || '',
        period_months: 1,
        start_date: startDate.toISOString().split('T')[0],
        end_date: '',
        plan_amount: 0,
        discount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total_bill_amount: 0,
        amount_paid: 0,
        balance: 0,
        payment_method: 'CASH',
        payment_id: generatePaymentId('CASH'),
        remarks: ''
      })
      setError('')
    }
  }, [isOpen, customer])

  useEffect(() => {
    if (formData.start_date && formData.period_months) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + formData.period_months)
      setFormData(prev => ({ ...prev, end_date: endDate.toISOString().split('T')[0] }))
    }
  }, [formData.start_date, formData.period_months])

  useEffect(() => {
    calculateBilling()
  }, [formData.plan_id, formData.discount, settings, customer])

  useEffect(() => {
    const balance = formData.total_bill_amount - formData.amount_paid
    setFormData(prev => ({ ...prev, balance }))
  }, [formData.total_bill_amount, formData.amount_paid])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/')
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const calculateBilling = () => {
    if (!formData.plan_id || !settings || !customer) return

    const selectedPlan = plans.find(p => p.id === parseInt(formData.plan_id))
    if (!selectedPlan) return

    const planAmount = selectedPlan.plan_amount
    const afterDiscount = planAmount - formData.discount

    let cgst = 0, sgst = 0, igst = 0

    if (customer.state === settings.company_state) {
      cgst = afterDiscount * 0.09
      sgst = afterDiscount * 0.09
    } else {
      igst = afterDiscount * 0.18
    }

    const totalBillAmount = afterDiscount + cgst + sgst + igst

    setFormData(prev => ({
      ...prev,
      plan_amount: planAmount,
      cgst,
      sgst,
      igst,
      total_bill_amount: totalBillAmount
    }))
  }

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
    
    if (!formData.plan_id) {
      setError('Please select a plan')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/renewals/', {
        customer_id: customer.id,
        plan_id: parseInt(formData.plan_id),
        period_months: formData.period_months,
        start_date: formData.start_date,
        end_date: formData.end_date,
        plan_amount: formData.plan_amount,
        discount: formData.discount,
        cgst: formData.cgst,
        sgst: formData.sgst,
        igst: formData.igst,
        total_bill_amount: formData.total_bill_amount,
        amount_paid: formData.amount_paid,
        balance: formData.balance,
        payment_method: formData.payment_method,
        payment_id: formData.payment_id,
        remarks: formData.remarks
      })
      
      alert('Subscription renewed successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to renew subscription')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Renew Subscription</h2>
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
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><span className="font-medium">Customer ID:</span> {customer.customer_id}</p>
                <p><span className="font-medium">Name:</span> {customer.full_name}</p>
              </div>
              <div>
                <p><span className="font-medium">Current Plan:</span> {customer.plan_name || 'N/A'}</p>
                <p><span className="font-medium">Expiry Date:</span> {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString('en-GB') : 'N/A'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Plan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.plan_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name} - ₹{plan.plan_amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.period_months}
                  onChange={(e) => setFormData(prev => ({ ...prev, period_months: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Amount</label>
                  <input
                    type="number"
                    value={formData.plan_amount}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGST (9%)</label>
                  <input
                    type="number"
                    value={formData.cgst.toFixed(2)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SGST (9%)</label>
                  <input
                    type="number"
                    value={formData.sgst.toFixed(2)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IGST (18%)</label>
                  <input
                    type="number"
                    value={formData.igst.toFixed(2)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Bill Amount</label>
                  <input
                    type="number"
                    value={formData.total_bill_amount.toFixed(2)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount_paid: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    value={formData.balance.toFixed(2)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                  <input
                    type="text"
                    value={formData.payment_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter any remarks (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
                <RefreshCw className="h-4 w-4" />
                {loading ? 'Renewing...' : 'Renew Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
