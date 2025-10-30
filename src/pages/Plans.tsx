import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import api from '../utils/api'

interface Plan {
  id: number
  name: string
  service_type: string
  speed: string
  data_limit: string
  price: number
  validity_months: number
  cgst_percentage: number
  sgst_percentage: number
  igst_percentage: number
  total_amount: number
  description: string
  is_active: boolean
}

interface PlanFormData {
  name: string
  service_type: string
  speed: string
  data_limit: string
  price: number
  validity_months: number
  cgst_percentage: number
  sgst_percentage: number
  igst_percentage: number
  description: string
  is_active: boolean
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    service_type: 'broadband',
    speed: '',
    data_limit: 'Unlimited',
    price: 0,
    validity_months: 1,
    cgst_percentage: 0,
    sgst_percentage: 0,
    igst_percentage: 0,
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/')
      setPlans(response.data)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAmount = () => {
    const price = formData.price || 0
    const cgst = (price * (formData.cgst_percentage || 0)) / 100
    const sgst = (price * (formData.sgst_percentage || 0)) / 100
    const igst = (price * (formData.igst_percentage || 0)) / 100
    return (price + cgst + sgst + igst).toFixed(2)
  }

  const handleOpenAddModal = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      service_type: 'broadband',
      speed: '',
      data_limit: 'Unlimited',
      price: 0,
      validity_months: 1,
      cgst_percentage: 0,
      sgst_percentage: 0,
      igst_percentage: 0,
      description: '',
      is_active: true
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      service_type: plan.service_type,
      speed: plan.speed,
      data_limit: plan.data_limit,
      price: plan.price,
      validity_months: plan.validity_months,
      cgst_percentage: plan.cgst_percentage,
      sgst_percentage: plan.sgst_percentage,
      igst_percentage: plan.igst_percentage,
      description: plan.description,
      is_active: plan.is_active
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, formData)
        alert('Plan updated successfully!')
      } else {
        await api.post('/plans/', formData)
        alert('Plan added successfully!')
      }
      handleCloseModal()
      fetchPlans()
    } catch (error) {
      console.error('Failed to save plan:', error)
      alert('Failed to save plan. Please try again.')
    }
  }

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await api.delete(`/plans/${planId}`)
      alert('Plan deleted successfully!')
      fetchPlans()
    } catch (error) {
      console.error('Failed to delete plan:', error)
      alert('Failed to delete plan. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Plans Management</h1>
        <button 
          onClick={handleOpenAddModal}
          className="bg-isp-teal text-white px-6 py-2 rounded-lg hover:bg-isp-accent transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-isp-teal text-white">
            <tr>
              <th className="px-4 py-3 text-left">Plan Name</th>
              <th className="px-4 py-3 text-left">Service Type</th>
              <th className="px-4 py-3 text-left">Speed</th>
              <th className="px-4 py-3 text-left">Data Limit</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Total Amount</th>
              <th className="px-4 py-3 text-left">Validity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Loading plans...
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No plans found
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{plan.name}</td>
                  <td className="px-4 py-3 uppercase">{plan.service_type}</td>
                  <td className="px-4 py-3">{plan.speed}</td>
                  <td className="px-4 py-3">{plan.data_limit}</td>
                  <td className="px-4 py-3">₹{plan.price}</td>
                  <td className="px-4 py-3">₹{plan.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3">{plan.validity_months} month</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Edit Plan"
                      >
                        <Edit className="w-4 h-4 text-green-600" />
                      </button>
                      <button 
                        onClick={() => handleDelete(plan.id)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  required
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                >
                  <option value="broadband">Broadband</option>
                  <option value="cable_tv">Cable TV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 100 Mbps"
                  value={formData.speed}
                  onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Limit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Unlimited or 500 GB"
                  value={formData.data_limit}
                  onChange={(e) => setFormData({ ...formData, data_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity (Months) *
                </label>
                <input
                  type="number"
                  required
                  disabled
                  value={formData.validity_months}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CGST %
                  </label>
                  <input
                    type="number"
                    value={formData.cgst_percentage}
                    onChange={(e) => setFormData({ ...formData, cgst_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SGST %
                  </label>
                  <input
                    type="number"
                    value={formData.sgst_percentage}
                    onChange={(e) => setFormData({ ...formData, sgst_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IGST %
                  </label>
                  <input
                    type="number"
                    value={formData.igst_percentage}
                    onChange={(e) => setFormData({ ...formData, igst_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Plan Amount
                </label>
                <input
                  type="text"
                  disabled
                  value={`₹${calculateTotalAmount()}`}
                  placeholder="Auto-calculated"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-isp-teal border-gray-300 rounded focus:ring-isp-teal"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-isp-teal text-white rounded-lg hover:bg-isp-accent transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plans
