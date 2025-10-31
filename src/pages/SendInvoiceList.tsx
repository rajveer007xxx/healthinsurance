import React, { useState, useEffect } from 'react'
import { Download, Trash2, Send } from 'lucide-react'
import api from '../utils/api'

interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  customer: {
    customer_id: string
    full_name: string
    service_type: string
  }
  invoice_date: string
  total_amount: number
  balance_amount: number
  status: string
  sent_type: string
  remarks: string
  created_at: string
}

const SendInvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('Both')
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/invoices/sent-list')
      setInvoices(response.data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      alert('Error fetching invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
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
      alert('Error downloading PDF')
    }
  }

  const handleResendInvoice = async (invoiceId: number) => {
    try {
      await api.post(`/invoices/${invoiceId}/resend`)
      alert('Invoice resent successfully!')
    } catch (error) {
      console.error('Error resending invoice:', error)
      alert('Error resending invoice')
    }
  }

  const handleDeleteInvoice = async (invoiceId: number, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return
    }
    
    try {
      await api.delete(`/invoices/${invoiceId}`)
      alert('Invoice deleted successfully!')
      fetchInvoices() // Refresh the list
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Error deleting invoice')
    }
  }

  const handleDownloadMonth = async () => {
    if (!selectedMonth) {
      alert('Please select a month')
      return
    }

    try {
      const response = await api.get(`/invoices/download-month/${selectedMonth}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoices_${selectedMonth}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading invoices:', error)
      alert('Error downloading invoices for selected month')
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = 
      filterType === 'Both' || 
      invoice.sent_type === filterType.toUpperCase()
    
    const matchesMonth = !selectedMonth || 
      invoice.invoice_date.startsWith(selectedMonth)
    
    return matchesSearch && matchesType && matchesMonth
  })

  const getAlphabetLetters = () => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  }

  const [selectedLetter, setSelectedLetter] = useState('All')

  const letterFilteredInvoices = selectedLetter === 'All' 
    ? filteredInvoices 
    : filteredInvoices.filter(inv => 
        inv.customer.full_name.toUpperCase().startsWith(selectedLetter)
      )

  return (
    <>
      <div className="space-y-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Send Invoice List</h1>
        </div>

        <div className="bg-white shadow p-2 border border-gray-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Filter Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              >
                <option>Both</option>
                <option>Auto</option>
                <option>Manual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Download</label>
              <button
                onClick={handleDownloadMonth}
                disabled={!selectedMonth}
                className={`w-full px-2 py-1 text-sm ${
                  selectedMonth 
                    ? 'bg-[#448996] text-white hover:bg-[#336677]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4 inline mr-1" />
                Download
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-2 border border-gray-300">
          <div className="flex flex-wrap gap-0.5">
            <button
              onClick={() => setSelectedLetter('All')}
              className={`px-2 py-1 text-xs font-medium border border-[#448996] ${
                selectedLetter === 'All' 
                  ? 'bg-[#448996] text-white' 
                  : 'bg-[#448996] text-white hover:bg-[#336677]'
              }`}
            >
              All
            </button>
            {getAlphabetLetters().map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-1 text-xs font-medium border border-[#448996] ${
                  selectedLetter === letter 
                    ? 'bg-[#336677] text-white' 
                    : 'bg-[#448996] text-white hover:bg-[#336677]'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow w-full border border-gray-300">
          <div className="overflow-auto" style={{ maxHeight: '500px', overflowX: 'auto', overflowY: 'auto' }}>
            <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
              <thead className="bg-[#448996] text-white sticky top-0 z-10">
                <tr>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">S.No.</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Customer Id</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Customer Name</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Service Type</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Invoice No.</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Invoice Date</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Sent Type</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Remarks</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Created On</th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-2 py-4 text-center text-gray-500 border border-gray-300">
                    Loading invoices...
                  </td>
                </tr>
              ) : letterFilteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-2 py-4 text-center text-gray-500 border border-gray-300">
                    No invoices found
                  </td>
                </tr>
              ) : (
                letterFilteredInvoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    className="hover:bg-gray-50"
                  >
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{index + 1}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{invoice.customer.customer_id}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{invoice.customer.full_name}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{invoice.customer.service_type || '-'}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{invoice.invoice_number}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">
                      <span className={`px-2 py-1 text-xs ${
                        invoice.sent_type === 'AUTO' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.sent_type}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">{invoice.remarks || '-'}</td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">
                      {new Date(invoice.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-2 py-2 text-sm text-center border border-gray-300">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                          className="text-[#448996] hover:text-[#336677]"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleResendInvoice(invoice.id)}
                          className="text-[#448996] hover:text-[#336677]"
                          title="Resend Invoice"
                        >
                          <Send size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id, invoice.invoice_number)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Invoice"
                        >
                          <Trash2 size={18} />
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
    </>
  )
}

export default SendInvoiceList
