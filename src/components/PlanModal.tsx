import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Plan {
  id?: number
  plan_name: string
  service_type: string
  speed: string
  data_limit: string
  price: number
  cgst_percentage?: number
  sgst_percentage?: number
  igst_percentage?: number
  validity: string
  status: string
}

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: Plan) => Promise<void>
  plan?: Plan | null
}

export default function PlanModal({ isOpen, onClose, onSave, plan }: PlanModalProps) {
  const [formData, setFormData] = useState<Plan>({
    plan_name: '',
    service_type: 'BROADBAND',
    speed: '',
    data_limit: 'Unlimited',
    price: 0,
    cgst_percentage: 9,
    sgst_percentage: 9,
    igst_percentage: 0,
    validity: '1 month',
    status: 'Active'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (plan) {
      setFormData(plan)
    } else {
      setFormData({
        plan_name: '',
        service_type: 'BROADBAND',
        speed: '',
        data_limit: 'Unlimited',
        price: 0,
        cgst_percentage: 9,
        sgst_percentage: 9,
        igst_percentage: 0,
        validity: '1 month',
        status: 'Active'
      })
    }
    setError('')
  }, [plan, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onSave(formData)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save plan')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const totalAmount = formData.price + 
    (formData.price * (formData.cgst_percentage || 0) / 100) +
    (formData.price * (formData.sgst_percentage || 0) / 100) +
    (formData.price * (formData.igst_percentage || 0) / 100)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {plan ? 'Edit Plan' : 'Add New Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input
                type="text"
                value={formData.plan_name}
                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="BROADBAND">Broadband</option>
                <option value="CABLE_TV">Cable TV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
              <input
                type="text"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                placeholder="e.g., 50 Mbps"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Limit</label>
              <input
                type="text"
                value={formData.data_limit}
                onChange={(e) => setFormData({ ...formData, data_limit: e.target.value })}
                placeholder="e.g., Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
              <input
                type="text"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                placeholder="e.g., 1 month"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGST %</label>
              <input
                type="number"
                value={formData.cgst_percentage}
                onChange={(e) => setFormData({ ...formData, cgst_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGST %</label>
              <input
                type="number"
                value={formData.sgst_percentage}
                onChange={(e) => setFormData({ ...formData, sgst_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IGST %</label>
              <input
                type="number"
                value={formData.igst_percentage}
                onChange={(e) => setFormData({ ...formData, igst_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Amount (including taxes):</span>
                  <span className="text-lg font-bold text-teal-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
