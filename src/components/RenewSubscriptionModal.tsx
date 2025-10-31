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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && customer) {
      setRenewWithMonths(1)
      setInstantRenewMonths(1)
      setInstantRenewDate('')
      setAutoRenew(false)
      setActivateCustomer(customer.status === 'active')
      setError('')
    }
  }, [isOpen, customer])

  const handleRenewWithCurrentDate = async () => {
    if (!customer) return
    
    setLoading(true)
    setError('')

    try {
      await api.post('/renewals/', {
        customer_id: customer.id,
        period_months: renewWithMonths,
        renew_from: 'current_date'
      })
      
      alert(`Subscription renewed for ${renewWithMonths} month(s) from current date!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to renew subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleInstantRenew = async () => {
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
        start_date: instantRenewDate
      })
      
      alert(`Subscription renewed for ${instantRenewMonths} month(s) from ${instantRenewDate}!`)
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

  const handleAddGracePeriod = async () => {
    if (!customer) return
    
    const days = prompt('Enter number of grace period days:')
    if (!days || isNaN(parseInt(days))) return
    
    setLoading(true)
    setError('')

    try {
      await api.post(`/customers/${customer.id}/add-grace-period`, {
        days: parseInt(days)
      })
      
      alert(`Grace period of ${days} days added successfully!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add grace period')
    } finally {
      setLoading(false)
    }
  }

  const handleStartConnection = async () => {
    if (!customer) return
    
    setLoading(true)
    setError('')

    try {
      await api.post(`/customers/${customer.id}/start-connection`)
      
      alert('Connection started successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start connection')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!customer) return
    
    if (!confirm('Are you sure you want to suspend this customer?')) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      await api.post(`/customers/${customer.id}/suspend`)
      
      alert('Customer suspended successfully!')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to suspend customer')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !customer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">View Connections</h2>
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
              <div className="bg-gray-600 text-white text-center py-2 mb-4 rounded">
                <h3 className="font-semibold">Actions</h3>
              </div>

              <div className="bg-blue-100 py-2 px-3 mb-3 rounded">
                <h4 className="font-semibold text-gray-800 text-center">General</h4>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={handleAddGracePeriod}
                  className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Add Grace Period
                </button>
                <button
                  onClick={handleStartConnection}
                  className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Start Connection
                </button>
                <button
                  onClick={handleSuspend}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Suspend
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-between bg-white p-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Auto Renew:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                      className="sr-only peer"
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
                      onChange={(e) => setActivateCustomer(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              <div className="text-xs text-red-600 mb-4 text-right">*To change status only</div>

              <div className="bg-blue-100 py-2 px-3 mb-3 rounded">
                <h4 className="font-semibold text-gray-800 text-center">Renew</h4>
              </div>

              <div className="bg-white p-3 rounded mb-3">
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
                  <button
                    onClick={handleRenewWithCurrentDate}
                    className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded mb-4">
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
                  <button
                    onClick={handleInstantRenew}
                    className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 text-sm disabled:opacity-50"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>

              <div className="bg-blue-100 py-2 px-3 mb-3 rounded">
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
