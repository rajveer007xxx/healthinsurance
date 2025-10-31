import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../utils/api'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  plan_id?: number
  plan_name?: string
  expiry_date?: string
  status?: string
  username?: string
}

interface RenewSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess: () => void
}

export default function RenewSubscriptionModal({ isOpen, onClose, customer, onSuccess }: RenewSubscriptionModalProps) {
  const [renewWithMonths, setRenewWithMonths] = useState(1)
  const [instantRenewMonths, setInstantRenewMonths] = useState(1)
  const [instantRenewDate, setInstantRenewDate] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [activateCustomer, setActivateCustomer] = useState(false)
  const [updateEndDate, setUpdateEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      setRenewWithMonths(1)
      setInstantRenewMonths(1)
      setInstantRenewDate('')
      setAutoRenew(false)
      setActivateCustomer(customer.status === 'active')
      setUpdateEndDate(customer.expiry_date || '')
      setError('')
    }
  }, [isOpen, customer])

  const handleUpdateEndDate = async () => {
    if (!customer) return
    
    if (!updateEndDate) {
      setError('Please select an end date')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await api.patch(`/customers/${customer.id}`, {
        expiry_date: updateEndDate
      })
      
      alert('End date updated successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update end date')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoRenewToggle = async (checked: boolean) => {
    if (!customer) return
    
    setLoading(true)
    setError('')

    try {
      await api.patch(`/customers/${customer.id}`, {
        auto_renew: checked
      })
      
      setAutoRenew(checked)
      alert(`Auto renew ${checked ? 'enabled' : 'disabled'} successfully!`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update auto renew')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateCustomerToggle = async (checked: boolean) => {
    if (!customer) return
    
    setLoading(true)
    setError('')

    try {
      await api.patch(`/customers/${customer.id}`, {
        status: checked ? 'active' : 'inactive'
      })
      
      setActivateCustomer(checked)
      alert(`Customer ${checked ? 'activated' : 'deactivated'} successfully!`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update customer status')
    } finally {
      setLoading(false)
    }
  }

  const handleRenewWithCurrentDate = async (withInvoice: boolean) => {
    if (!customer) return
    
    setLoading(true)
    setError('')

    try {
      await api.post('/renewals/', {
        customer_id: customer.id,
        period_months: renewWithMonths,
        renew_from: 'current_date',
        generate_invoice: withInvoice
      })
      
      alert(`Subscription renewed for ${renewWithMonths} month(s) from current date${withInvoice ? ' with invoice' : ' without invoice'}!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to renew subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleInstantRenew = async (withInvoice: boolean) => {
    if (!customer) return
    
    if (!instantRenewDate) {
      setError('Please select a renew date')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await api.post('/renewals/', {
        customer_id: customer.id,
        period_months: instantRenewMonths,
        start_date: instantRenewDate,
        generate_invoice: withInvoice
      })
      
      alert(`Subscription renewed for ${instantRenewMonths} month(s) from ${instantRenewDate}${withInvoice ? ' with invoice' : ' without invoice'}!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to renew subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleRevertLastRenew = async () => {
    if (!customer) return
    
    if (!confirm('Are you sure you want to revert the last renewal? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await api.post(`/customers/${customer.id}/revert-renewal`)
      
      alert('Last renewal reverted successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to revert renewal')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Renew Customer</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="bg-gray-600 text-white text-center py-2 mb-4 rounded">
                <h3 className="font-semibold">Connection Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Customer Name</div>
                  <div className="text-gray-900">{customer.full_name}</div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Customer ID</div>
                  <div className="text-gray-900">{customer.customer_id}</div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Username</div>
                  <div className="text-gray-900">{customer.username || customer.full_name}</div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Plan Name</div>
                  <div className="text-gray-900">{customer.plan_name || 'N/A'}</div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Start Date</div>
                  <div className="text-gray-900">
                    {customer.expiry_date ? new Date(new Date(customer.expiry_date).setMonth(new Date(customer.expiry_date).getMonth() - 1)).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">End Date</div>
                  <div className="text-gray-900">
                    {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>

                <div className="bg-white p-3 rounded">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Status</div>
                  <div className={`font-semibold ${customer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.status || 'Deactive'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="bg-gray-600 text-white text-center py-2 mb-3 rounded">
                <h3 className="font-semibold">Actions</h3>
              </div>

              <div className="bg-blue-100 py-2 px-3 mb-2 rounded">
                <h4 className="font-semibold text-gray-800 text-center">General</h4>
              </div>

              <div className="bg-white p-3 rounded mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={updateEndDate}
                    onChange={(e) => setUpdateEndDate(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleUpdateEndDate}
                    className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Update End Date
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Auto Renew:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => handleAutoRenewToggle(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Activate Customer:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activateCustomer}
                      onChange={(e) => handleActivateCustomerToggle(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-100 py-2 px-3 mb-2 rounded">
                <h4 className="font-semibold text-gray-800 text-center">Renew</h4>
              </div>

              <div className="bg-white p-3 rounded mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Renew With</span>
                  <select className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm">
                    <option>Current Date</option>
                  </select>
                  <span className="text-sm text-gray-700">for</span>
                  <input
                    type="number"
                    min="1"
                    value={renewWithMonths}
                    onChange={(e) => setRenewWithMonths(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                  <span className="text-sm text-gray-700">Month</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRenewWithCurrentDate(true)}
                    className="flex-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Renew with Invoice
                  </button>
                  <button
                    onClick={() => handleRenewWithCurrentDate(false)}
                    className="flex-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Renew without Invoice
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Instant Renew From</span>
                  <input
                    type="date"
                    value={instantRenewDate}
                    onChange={(e) => setInstantRenewDate(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Choose renew date"
                  />
                  <span className="text-sm text-gray-700">for</span>
                  <input
                    type="number"
                    min="1"
                    value={instantRenewMonths}
                    onChange={(e) => setInstantRenewMonths(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                  <span className="text-sm text-gray-700">Month</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInstantRenew(true)}
                    className="flex-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Renew with Invoice
                  </button>
                  <button
                    onClick={() => handleInstantRenew(false)}
                    className="flex-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Renew without Invoice
                  </button>
                </div>
              </div>

              <div className="bg-blue-100 py-2 px-3 mb-2 rounded">
                <h4 className="font-semibold text-gray-800 text-center">Renew Reversal</h4>
              </div>

              <button
                onClick={handleRevertLastRenew}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                disabled={loading}
              >
                Revert Last Renew
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
