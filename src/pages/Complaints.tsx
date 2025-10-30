import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Complaint {
  id: number
  complaintId: string
  subject: string
  priority: string
  status: string
  created: string
}

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints')
      setComplaints(response.data)
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Complaints</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-isp-teal text-white">
            <tr>
              <th className="px-4 py-3 text-left">Complaint ID</th>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading complaints...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{complaint.complaintId}</td>
                  <td className="px-4 py-3">{complaint.subject}</td>
                  <td className="px-4 py-3">{complaint.priority}</td>
                  <td className="px-4 py-3">{complaint.status}</td>
                  <td className="px-4 py-3">{complaint.created}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Complaints
