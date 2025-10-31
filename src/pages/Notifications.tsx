import { useEffect, useState } from 'react'
import { Bell, Trash2, CheckCircle } from 'lucide-react'
import api from '../utils/api'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/')
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDelete = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(notifications.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded shadow p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded shadow p-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-2">{notification.created_at}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-green-600 hover:text-green-800 p-1" 
                      title="Mark as Read"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notification.id)}
                    className="text-red-600 hover:text-red-800 p-1" 
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
