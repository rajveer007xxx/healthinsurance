import { useEffect, useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import api from '../utils/api'

interface DeletedUser {
  id: number
  customer_name: string
  email: string
  phone: string
  deleted_date: string
  deleted_by: string
  reason: string
}

export default function DeletedUsers() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeletedUsers()
  }, [])

  const fetchDeletedUsers = async () => {
    try {
      const response = await api.get('/customers/deleted/')
      setDeletedUsers(response.data)
    } catch (error) {
      console.error('Error fetching deleted users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (userId: number) => {
    if (!confirm('Are you sure you want to restore this user?')) {
      return
    }
    try {
      await api.patch(`/customers/${userId}/restore`)
      setDeletedUsers(deletedUsers.filter(u => u.id !== userId))
      alert('User restored successfully')
    } catch (error) {
      console.error('Error restoring user:', error)
      alert('Failed to restore user')
    }
  }

  const handlePermanentDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return
    }
    try {
      await api.delete(`/customers/${userId}/permanent`)
      setDeletedUsers(deletedUsers.filter(u => u.id !== userId))
      alert('User permanently deleted')
    } catch (error) {
      console.error('Error permanently deleting user:', error)
      alert('Failed to permanently delete user')
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Deleted Users</h1>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Deleted Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Deleted By</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deletedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No deleted users found
                  </td>
                </tr>
              ) : (
                deletedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.deleted_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.deleted_by}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.reason}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRestore(user.id)}
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Restore User"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(user.id)}
                          className="text-red-600 hover:text-red-800 p-1" 
                          title="Permanently Delete"
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
