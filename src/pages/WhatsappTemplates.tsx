import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'
import api from '../utils/api'

interface Template {
  id: number
  template_name: string
  message: string
  category: string
  created_at: string
}

export default function WhatsappTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/whatsapp/templates/')
      setTemplates(response.data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }
    try {
      await api.delete(`/whatsapp/templates/${templateId}`)
      setTemplates(templates.filter(t => t.id !== templateId))
      alert('Template deleted successfully')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
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
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Templates</h1>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Add Template
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Template Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No templates found</p>
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{template.template_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{template.message.substring(0, 50)}...</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{template.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{template.created_at}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800 p-1" 
                          title="Delete Template"
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
