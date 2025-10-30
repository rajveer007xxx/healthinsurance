import { useEffect, useState } from 'react'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import api from '../utils/api'

interface Complaint {
  id: number
  complaint_id: string
  subject: string
  priority: string
  status: string
  created: string
  customer_name?: string
  description?: string
}

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/')
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewComplaint = (complaintId: number) => {
    console.log('View complaint:', complaintId)
    alert('View complaint functionality - to be implemented')
  }

  const handleEditComplaint = (complaintId: number) => {
    console.log('Edit complaint:', complaintId)
    alert('Edit complaint functionality - to be implemented')
  }

  const handleDeleteComplaint = async (complaintId: number) => {
    if (!confirm('Are you sure you want to delete this complaint?')) {
      return
    }
    try {
      await api.delete(`/complaints/${complaintId}`)
      setComplaints(complaints.filter(c => c.id !== complaintId))
      alert('Complaint deleted successfully')
    } catch (error) {
      console.error('Error deleting complaint:', error)
      alert('Failed to delete complaint')
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
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Complaint
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Complaint ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{complaint.complaint_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{complaint.subject}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        complaint.priority === 'High' ? 'bg-red-100 text-red-800' :
                        complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        complaint.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{complaint.created}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewComplaint(complaint.id)}
                          className="text-blue-600 hover:text-blue-800 p-1" 
                          title="View Complaint"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditComplaint(complaint.id)}
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Edit Complaint"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          className="text-red-600 hover:text-red-800 p-1" 
                          title="Delete Complaint"
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
      </div>
    </div>
  )
}
