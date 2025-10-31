import { useEffect, useState } from 'react'
import { Plus, Download, Send, Trash2 } from 'lucide-react'
import api from '../utils/api'

interface Invoice {
  id: number
  invoice_number: string
  sent_date: string
  customer_name: string
  amount: number
  status: string
}

export default function SendInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/manual-invoices/')
      setInvoices(response.data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const response = await api.get(`/manual-invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice_${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const handleResendInvoice = async (invoiceId: number) => {
    try {
      await api.post(`/manual-invoices/${invoiceId}/resend`)
      alert('Invoice resent successfully')
    } catch (error) {
      console.error('Error resending invoice:', error)
      alert('Failed to resend invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return
    }
    try {
      await api.delete(`/manual-invoices/${invoiceId}`)
      setInvoices(invoices.filter(inv => inv.id !== invoiceId))
      alert('Invoice deleted successfully')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
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
        <h1 className="text-2xl font-bold text-gray-900">Send Manually Invoice</h1>
        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Send Invoice
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-teal-600 text-white">
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{invoice.sent_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{invoice.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{invoice.amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownloadPDF(invoice.id)}
                          className="text-blue-600 hover:text-blue-800 p-1" 
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleResendInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Resend Invoice"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800 p-1" 
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
  )
}
