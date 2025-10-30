import { useState } from 'react'
import { Upload, Download, Database, AlertCircle } from 'lucide-react'
import api from '../utils/api'

export default function DataManagement() {
  const [loading, setLoading] = useState(false)

  const handleBackupDatabase = async () => {
    setLoading(true)
    try {
      const response = await api.get('/data/backup', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.sql`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      alert('Database backup downloaded successfully')
    } catch (error) {
      console.error('Error backing up database:', error)
      alert('Failed to backup database')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('Are you sure you want to restore the database? This will overwrite all existing data.')) {
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/data/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('Database restored successfully')
    } catch (error) {
      console.error('Error restoring database:', error)
      alert('Failed to restore database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center mb-4">
            <Download className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold">Backup Database</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Download a complete backup of your database including all customers, transactions, and settings.
          </p>
          <button 
            onClick={handleBackupDatabase}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Download Backup'}
          </button>
        </div>

        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold">Restore Database</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Restore your database from a backup file. This will overwrite all existing data.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Warning: This action cannot be undone. Make sure you have a current backup before proceeding.
              </p>
            </div>
          </div>
          <input 
            type="file" 
            accept=".sql,.db"
            onChange={handleRestoreDatabase}
            disabled={loading}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-6 bg-white rounded shadow p-6">
        <div className="flex items-center mb-4">
          <Database className="h-8 w-8 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold">Database Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-600">Database Size</p>
            <p className="text-2xl font-bold text-gray-900">-- MB</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-600">Last Backup</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
      </div>
    </div>
  )
}
