import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import api from '../utils/api'
import { Download, Send, Trash2 } from 'lucide-react'

interface ManualInvoice {
  id: number
  invoice_number: string
  customer_id: number
  customer_name: string
  amount: number
  status: string
  sent_date: string
  created_at: string
}

export default function SendInvoices() {
  const [invoices, setInvoices] = useState<ManualInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manual-invoices/')
      setInvoices(response.data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const downloadPDF = async (invoiceNumber: string) => {
    try {
      const response = await api.get(`/manual-invoices/pdf/${invoiceNumber}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice_${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const resendInvoice = async (invoiceId: number) => {
    try {
      await api.post(`/manual-invoices/resend/${invoiceId}`)
      alert('Invoice resent successfully!')
      fetchInvoices()
    } catch (error) {
      console.error('Error resending invoice:', error)
      alert('Failed to resend invoice')
    }
  }

  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      await api.delete(`/manual-invoices/${invoiceId}`)
      alert('Invoice deleted successfully!')
      fetchInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Manually Invoice</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#448996] text-white rounded hover:bg-[#357580] transition-colors"
          >
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#448996] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Invoice Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Sent Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.sent_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.customer_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAmount(invoice.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadPDF(invoice.invoice_number)}
                            className="p-1 text-[#448996] hover:bg-gray-100 rounded"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => resendInvoice(invoice.id)}
                            className="p-1 text-blue-600 hover:bg-gray-100 rounded"
                            title="Resend Invoice"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="p-1 text-red-600 hover:bg-gray-100 rounded"
                            title="Delete Invoice"
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
    </AdminLayout>
  )
}
