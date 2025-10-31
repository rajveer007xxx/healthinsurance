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
  end_date?: string
  status?: string
  username?: string
  auto_renew?: boolean
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
      setAutoRenew(customer.auto_renew || false)
      setActivateCustomer(customer.status === 'ACTIVE')
      setUpdateEndDate(customer.end_date ? customer.end_date.split('T')[0] : '')
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
      const endDateISO = new Date(updateEndDate + 'T00:00:00').toISOString()
      await api.put(`/customers/${customer.id}`, {
        end_date: endDateISO,
        status: 'ACTIVE'
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
      await api.put(`/customers/${customer.id}`, {
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
      await api.put(`/customers/${customer.id}`, {
        status: checked ? 'ACTIVE' : 'DEACTIVE'
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
      if (withInvoice) {
        await api.post(`/customers/${customer.id}/renew?period_months=${renewWithMonths}`)
        alert(`Subscription renewed for ${renewWithMonths} month(s) with invoice!`)
      } else {
        if (!customer.end_date) {
          setError('Customer end date not found')
          return
        }
        const currentEndDate = new Date(customer.end_date)
        const newEndDate = new Date(currentEndDate.getTime() + (renewWithMonths * 30 * 24 * 60 * 60 * 1000))
        await api.put(`/customers/${customer.id}`, {
          end_date: newEndDate.toISOString(),
          status: 'ACTIVE'
        })
        alert(`Subscription renewed for ${renewWithMonths} month(s) without invoice!`)
      }
      
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
      if (withInvoice) {
        await api.post(`/customers/${customer.id}/renew?period_months=${instantRenewMonths}`)
        alert(`Subscription renewed for ${instantRenewMonths} month(s) with invoice!`)
      } else {
        const startDate = new Date(instantRenewDate)
        const newEndDate = new Date(startDate.getTime() + (instantRenewMonths * 30 * 24 * 60 * 60 * 1000))
        await api.put(`/customers/${customer.id}`, {
          end_date: newEndDate.toISOString(),
          status: 'ACTIVE'
        })
        alert(`Subscription renewed for ${instantRenewMonths} month(s) without invoice!`)
      }
      
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
    
    setError('Revert Last Renew functionality is not available. Please contact administrator.')
    
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

        <div className="p-4">
          {error && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="bg-gray-600 text-white text-center py-1 mb-2 rounded">
                <h3 className="font-semibold text-sm">Connection Information</h3>
              </div>
              
              <div className="space-y-1">
                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Customer Name</div>
                  <div className="text-sm text-gray-900">{customer.full_name}</div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Customer ID</div>
                  <div className="text-sm text-gray-900">{customer.customer_id}</div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Username</div>
                  <div className="text-sm text-gray-900">{customer.username || customer.full_name}</div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Plan Name</div>
                  <div className="text-sm text-gray-900">{customer.plan_name || 'N/A'}</div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Start Date</div>
                  <div className="text-sm text-gray-900">
                    {customer.end_date ? new Date(new Date(customer.end_date).setMonth(new Date(customer.end_date).getMonth() - 1)).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">End Date</div>
                  <div className="text-sm text-gray-900">
                    {customer.end_date ? new Date(customer.end_date).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </div>

                <div className="bg-white p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Status</div>
                  <div className={`text-sm font-semibold ${customer.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.status || 'DEACTIVE'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="bg-gray-600 text-white text-center py-1 mb-2 rounded">
                <h3 className="font-semibold text-sm">Actions</h3>
              </div>

              <div className="bg-blue-100 py-1 px-2 mb-1 rounded">
                <h4 className="font-semibold text-gray-800 text-center text-xs">General</h4>
              </div>

              <div className="bg-white p-2 rounded mb-1">
                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-700 whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={updateEndDate}
                    onChange={(e) => setUpdateEndDate(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <button
                    onClick={handleUpdateEndDate}
                    className="bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs disabled:opacity-50"
                    disabled={loading}
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-1">
                <div className="flex items-center justify-between bg-white p-1 rounded">
                  <span className="text-xs font-medium text-gray-700">Auto Renew:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => handleAutoRenewToggle(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between bg-white p-1 rounded">
                  <span className="text-xs font-medium text-gray-700">Activate:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activateCustomer}
                      onChange={(e) => handleActivateCustomerToggle(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-100 py-1 px-2 mb-1 rounded">
                <h4 className="font-semibold text-gray-800 text-center text-xs">Renew</h4>
              </div>

              <div className="bg-white p-2 rounded mb-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Renew With</span>
                  <select className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>Current Date</option>
                  </select>
                  <span className="text-xs text-gray-700">for</span>
                  <input
                    type="number"
                    min="1"
                    value={renewWithMonths}
                    onChange={(e) => setRenewWithMonths(parseInt(e.target.value) || 1)}
                    className="w-12 px-1 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                  <span className="text-xs text-gray-700">Mo</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRenewWithCurrentDate(true)}
                    className="flex-1 bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs disabled:opacity-50"
                    disabled={loading}
                  >
                    With Invoice
                  </button>
                  <button
                    onClick={() => handleRenewWithCurrentDate(false)}
                    className="flex-1 bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs disabled:opacity-50"
                    disabled={loading}
                  >
                    Without Invoice
                  </button>
                </div>
              </div>

              <div className="bg-white p-2 rounded mb-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Instant From</span>
                  <input
                    type="date"
                    value={instantRenewDate}
                    onChange={(e) => setInstantRenewDate(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <span className="text-xs text-gray-700">for</span>
                  <input
                    type="number"
                    min="1"
                    value={instantRenewMonths}
                    onChange={(e) => setInstantRenewMonths(parseInt(e.target.value) || 1)}
                    className="w-12 px-1 py-1 border border-gray-300 rounded text-xs text-center"
                  />
                  <span className="text-xs text-gray-700">Mo</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleInstantRenew(true)}
                    className="flex-1 bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs disabled:opacity-50"
                    disabled={loading}
                  >
                    With Invoice
                  </button>
                  <button
                    onClick={() => handleInstantRenew(false)}
                    className="flex-1 bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 text-xs disabled:opacity-50"
                    disabled={loading}
                  >
                    Without Invoice
                  </button>
                </div>
              </div>

              <div className="bg-blue-100 py-1 px-2 mb-1 rounded">
                <h4 className="font-semibold text-gray-800 text-center text-xs">Renew Reversal</h4>
              </div>

              <button
                onClick={handleRevertLastRenew}
                className="w-full bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 disabled:opacity-50 text-xs"
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
