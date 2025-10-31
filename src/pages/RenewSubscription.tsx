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
  plan_id: number
  plan_name: string
  plan_amount: number
  expiry_date: string
  balance: number
  state: string
  customer_state_code: string
}

interface Plan {
  id: number
  plan_name: string
  plan_amount: number
}

interface Settings {
  company_state_code: string
}

export default function RenewSubscription() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    plan_id: 0,
    period_months: 1,
    start_date: '',
    end_date: '',
    plan_amount: 0,
    cgst_tax: 0,
    sgst_tax: 0,
    igst_tax: 0,
    total_bill_amount: 0,
    amount_paid: 0,
    discount: 0,
    balance: 0,
    payment_method: 'CASH',
    payment_id: '',
    remarks: ''
  })

  useEffect(() => {
    if (id) {
      fetchCustomer()
      fetchPlans()
      fetchSettings()
    }
  }, [id])

  useEffect(() => {
    if (formData.payment_method) {
      const paymentId = generatePaymentId(formData.payment_method)
      setFormData(prev => ({ ...prev, payment_id: paymentId }))
    }
  }, [formData.payment_method])

  useEffect(() => {
    if (formData.start_date && formData.period_months) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + formData.period_months)
      setFormData(prev => ({ ...prev, end_date: endDate.toISOString().split('T')[0] }))
    }
  }, [formData.start_date, formData.period_months])

  useEffect(() => {
    calculateTaxes()
  }, [formData.plan_amount, formData.discount, customer, settings])

  useEffect(() => {
    calculateBalance()
  }, [formData.total_bill_amount, formData.amount_paid])

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`)
      const customerData = response.data
      setCustomer(customerData)
      
      const today = new Date()
      const expiryDate = new Date(customerData.expiry_date)
      const startDate = expiryDate > today ? expiryDate : today
      
      setFormData(prev => ({
        ...prev,
        plan_id: customerData.plan_id,
        start_date: startDate.toISOString().split('T')[0]
      }))
    } catch (error) {
      console.error('Error fetching customer:', error)
      alert('Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

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

  const handlePlanChange = (planId: number) => {
    const selectedPlan = plans.find(p => p.id === planId)
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        plan_id: planId,
        plan_amount: selectedPlan.plan_amount
      }))
    }
  }

  const calculateTaxes = () => {
    if (!customer || !settings) return

    const planAmount = Number(formData.plan_amount) || 0
    const discount = Number(formData.discount) || 0
    const netAmount = planAmount - discount

    const customerStateCode = customer.customer_state_code || customer.state
    const companyStateCode = settings.company_state_code

    let cgst = 0
    let sgst = 0
    let igst = 0

    if (customerStateCode === companyStateCode) {
      cgst = netAmount * 0.09
      sgst = netAmount * 0.09
    } else {
      igst = netAmount * 0.18
    }

    const totalAmount = netAmount + cgst + sgst + igst

    setFormData(prev => ({
      ...prev,
      cgst_tax: Number(cgst.toFixed(2)),
      sgst_tax: Number(sgst.toFixed(2)),
      igst_tax: Number(igst.toFixed(2)),
      total_bill_amount: Number(totalAmount.toFixed(2))
    }))
  }

  const calculateBalance = () => {
    const totalAmount = Number(formData.total_bill_amount) || 0
    const amountPaid = Number(formData.amount_paid) || 0
    const balance = totalAmount - amountPaid

    setFormData(prev => ({
      ...prev,
      balance: Number(balance.toFixed(2))
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.plan_id) {
      alert('Please select a plan')
      return
    }

    if (!formData.start_date) {
      alert('Please select start date')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/customers/${id}/renew`, {
        plan_id: formData.plan_id,
        period_months: formData.period_months,
        start_date: formData.start_date,
        end_date: formData.end_date,
        plan_amount: formData.plan_amount,
        cgst_tax: formData.cgst_tax,
        sgst_tax: formData.sgst_tax,
        igst_tax: formData.igst_tax,
        total_bill_amount: formData.total_bill_amount,
        amount_paid: formData.amount_paid,
        discount: formData.discount,
        balance: formData.balance,
        payment_method: formData.payment_method,
        payment_id: formData.payment_id,
        remarks: formData.remarks || null
      })
      alert('Subscription renewed successfully!')
      navigate('/admin/customers')
    } catch (error) {
      console.error('Error renewing subscription:', error)
      alert('Failed to renew subscription')
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
        <h1 className="text-2xl font-bold text-gray-900">Renew Subscription</h1>
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
              <span className="text-blue-700 font-medium">Current Plan:</span>
              <span className="ml-2 text-blue-900">{customer.plan_name}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Expiry Date:</span>
              <span className="ml-2 text-blue-900">{customer.expiry_date}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.plan_id}
                onChange={(e) => handlePlanChange(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.period_months}
                onChange={(e) => setFormData({ ...formData, period_months: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.plan_amount}
                  onChange={(e) => setFormData({ ...formData, plan_amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGST (9%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cgst_tax}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SGST (9%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sgst_tax}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IGST (18%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.igst_tax}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Bill Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_bill_amount}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
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
                />
              </div>

              <div className="md:col-span-2">
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
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
              {submitting ? 'Renewing...' : 'Renew Subscription'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
