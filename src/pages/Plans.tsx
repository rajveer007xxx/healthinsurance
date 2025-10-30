import AdminLayout from '../components/AdminLayout'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Plus, Edit, Trash2, X } from 'lucide-react'

interface Plan {
  id: number
  name: string
  price: number
  speed: string
  data_limit: string
  validity_months: number
  cgst_percentage: number
  sgst_percentage: number
  igst_percentage: number
  total_amount: number | null
  description: string
  service_type: string
  is_active: boolean
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '' as any,
    speed: '',
    data_limit: 'Unlimited',
    validity_months: 1,
    cgst_percentage: '' as any,
    sgst_percentage: '' as any,
    igst_percentage: '' as any,
    description: '',
    service_type: 'broadband',
    is_active: true
  })
  const [totalAmount, setTotalAmount] = useState<number | null>(null)

  useEffect(() => {
    fetchPlans()
    
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault()
      }
    }
    
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useEffect(() => {
    const price = Number(formData.price) || 0
    const cgst = Number(formData.cgst_percentage) || 0
    const sgst = Number(formData.sgst_percentage) || 0
    const igst = Number(formData.igst_percentage) || 0
    
    if (price > 0 && (cgst > 0 || sgst > 0 || igst > 0)) {
      const cgstAmount = (price * cgst) / 100
      const sgstAmount = (price * sgst) / 100
      const igstAmount = (price * igst) / 100
      const total = price + cgstAmount + sgstAmount + igstAmount
      setTotalAmount(total)
    } else {
      setTotalAmount(null)
    }
  }, [formData.price, formData.cgst_percentage, formData.sgst_percentage, formData.igst_percentage])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/plans/')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '' as any,
      speed: '',
      data_limit: 'Unlimited',
      validity_months: 1,
      cgst_percentage: '' as any,
      sgst_percentage: '' as any,
      igst_percentage: '' as any,
      description: '',
      service_type: 'broadband',
      is_active: true
    })
    setTotalAmount(null)
    setShowModal(true)
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price,
      speed: plan.speed,
      data_limit: plan.data_limit,
      validity_months: plan.validity_months,
      cgst_percentage: plan.cgst_percentage,
      sgst_percentage: plan.sgst_percentage,
      igst_percentage: plan.igst_percentage,
      description: plan.description,
      service_type: plan.service_type,
      is_active: plan.is_active
    })
    setTotalAmount(plan.total_amount)
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      const price = Number(formData.price)
      if (!price || price <= 0) {
        alert('Please enter a valid price')
        return
      }
      
      const submitData = {
        name: formData.name,
        description: formData.description || '',
        service_type: formData.service_type.toUpperCase(),
        speed: formData.speed || '',
        data_limit: formData.data_limit || 'Unlimited',
        price: price,
        cgst_percentage: Number(formData.cgst_percentage) || 0,
        sgst_percentage: Number(formData.sgst_percentage) || 0,
        igst_percentage: Number(formData.igst_percentage) || 0,
        validity_months: Number(formData.validity_months) || 1,
        is_active: formData.is_active
      }
      
      console.log('Submitting plan data:', submitData)
      
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, submitData)
        alert('Plan updated successfully!')
      } else {
        await api.post('/plans/', submitData)
        alert('Plan added successfully!')
      }
      setShowModal(false)
      fetchPlans()
    } catch (error: any) {
      console.error('Error saving plan:', error)
      console.error('Error response:', error.response?.data)
      alert(`Error saving plan: ${error.response?.data?.detail || error.message}`)
    }
  }

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Are you sure you want to delete plan "${plan.name}"?`)) return
    
    try {
      await api.delete(`/plans/${plan.id}`)
      alert('Plan deleted successfully!')
      fetchPlans()
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Error deleting plan')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Plans Management</h1>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#008B8B] text-white hover:bg-[#006666]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </button>
        </div>

        {/* Plans Table */}
        <div className="bg-white shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#008B8B] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Speed</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No plans found</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{plan.service_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.speed}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.data_limit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{plan.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {plan.total_amount ? `₹${plan.total_amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.validity_months} month{plan.validity_months !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-[#008B8B] hover:text-[#006666]"
                          title="Edit Plan"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b bg-[#008B8B] text-white">
                <h2 className="text-2xl font-bold">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                    <select
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 "
                    >
                      <option value="broadband">Broadband</option>
                      <option value="cable_tv">Cable TV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speed *</label>
                    <input
                      type="text"
                      value={formData.speed}
                      onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                      placeholder="e.g., 100 Mbps"
                      className="w-full px-3 py-2 border border-gray-300 "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Limit *</label>
                    <input
                      type="text"
                      value={formData.data_limit}
                      onChange={(e) => setFormData({ ...formData, data_limit: e.target.value })}
                      placeholder="e.g., Unlimited or 500 GB"
                      className="w-full px-3 py-2 border border-gray-300 "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Months) *</label>
                    <input
                      type="number"
                      value={formData.validity_months}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-100 text-gray-700"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGST %</label>
                    <input
                      type="number"
                      value={formData.cgst_percentage}
                      onChange={(e) => setFormData({ ...formData, cgst_percentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SGST %</label>
                    <input
                      type="number"
                      value={formData.sgst_percentage}
                      onChange={(e) => setFormData({ ...formData, sgst_percentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IGST %</label>
                    <input
                      type="number"
                      value={formData.igst_percentage}
                      onChange={(e) => setFormData({ ...formData, igst_percentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Plan Amount</label>
                    <input
                      type="text"
                      value={totalAmount !== null ? `₹${totalAmount.toFixed(2)}` : ''}
                      className="w-full px-3 py-2 border border-gray-300  "
                      readOnly
                      placeholder="Auto-calculated"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 "
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#008B8B] text-white hover:bg-[#006666]"
                  >
                    {editingPlan ? 'Update Plan' : 'Add Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
