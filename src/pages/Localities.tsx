import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, X } from 'lucide-react'
import api from '../utils/api'

interface Locality {
  id: number
  name: string
  city: string
  state: string
  pincode: string
}

export default function Localities() {
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    fetchLocalities()
  }, [])

  const fetchLocalities = async () => {
    try {
      const response = await api.get('/localities/')
      setLocalities(response.data)
    } catch (error) {
      console.error('Error fetching localities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/localities/${editingId}`, formData)
        alert('Locality updated successfully!')
      } else {
        await api.post('/localities/', formData)
        alert('Locality added successfully!')
      }
      setShowModal(false)
      setFormData({ name: '', city: '', state: '', pincode: '' })
      setEditingId(null)
      fetchLocalities()
    } catch (error) {
      console.error('Error saving locality:', error)
      alert('Error saving locality')
    }
  }

  const handleEdit = (locality: Locality) => {
    setFormData({
      name: locality.name,
      city: locality.city,
      state: locality.state,
      pincode: locality.pincode
    })
    setEditingId(locality.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this locality?')) return
    
    try {
      await api.delete(`/localities/${id}`)
      alert('Locality deleted successfully!')
      fetchLocalities()
    } catch (error) {
      console.error('Error deleting locality:', error)
      alert('Error deleting locality')
    }
  }

  const handleAdd = () => {
    setFormData({ name: '', city: '', state: '', pincode: '' })
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Locality Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage localities for customer addresses</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Locality
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locality Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : localities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No localities found</td>
                </tr>
              ) : (
                localities.map((locality, index) => (
                  <tr key={locality.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{locality.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{locality.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{locality.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{locality.pincode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(locality)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(locality.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Locality' : 'Add Locality'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Sector 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Chandigarh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Punjab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 160015"
                />
              </div>
            </div>
            
            <div className="flex gap-2 p-6 border-t">
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingId ? 'Update' : 'Add'} Locality
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
