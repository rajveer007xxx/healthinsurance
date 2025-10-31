import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, DollarSign, Eye, Edit, RefreshCw, Send, MessageCircle, FileText, Trash2 } from 'lucide-react'
import api from '../utils/api'
import SendInvoiceModal from '../components/SendInvoiceModal'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  email?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  status: string
  plan_name: string
  plan_amount: number
  received_amount: number
  balance: number
  expiry_date: string
  category: string
  service_type: string
  locality_id: number
}

interface Locality {
  id: number
  name: string
}

export default function Userlist() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterLocality, setFilterLocality] = useState('all')
  const [filterServiceType, setFilterServiceType] = useState('both')
  const [filterExpiryDate, setFilterExpiryDate] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('All')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
    fetchLocalities()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/')
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocalities = async () => {
    try {
      const response = await api.get('/localities/')
      setLocalities(response.data)
    } catch (error) {
      console.error('Error fetching localities:', error)
    }
  }

  const handleCollectPayment = (customer: Customer) => {
    navigate(`/admin/payments/collect/${customer.id}`)
  }

  const handleViewTransactions = (customer: Customer) => {
    navigate(`/admin/transactions?customer_id=${customer.id}`)
  }

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/admin/customers/edit/${customer.id}`)
  }

  const handleRenewSubscription = (customer: Customer) => {
    navigate(`/admin/customers/renew/${customer.id}`)
  }

  const handleSendPaymentLink = async (customer: Customer) => {
    try {
      await api.post(`/customers/${customer.id}/send-payment-link`)
      alert('Payment link sent successfully!')
    } catch (error) {
      console.error('Error sending payment link:', error)
      alert('Failed to send payment link')
    }
  }

  const handleCreateComplaint = (customer: Customer) => {
    navigate(`/admin/complaints/create?customer_id=${customer.id}`)
  }

  const handleSendWhatsApp = async (customer: Customer) => {
    try {
      await api.post(`/customers/${customer.id}/send-whatsapp`)
      alert('WhatsApp message sent successfully!')
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      alert('Failed to send WhatsApp message')
    }
  }

  const handleSendInvoice = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowInvoiceModal(true)
  }

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      try {
        await api.delete(`/customers/${customerToDelete.id}`)
        await fetchCustomers()
        setShowDeleteConfirm(false)
        setCustomerToDelete(null)
        alert('Customer deleted successfully!')
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Failed to delete customer')
      }
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.mobile.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || customer.status.toUpperCase() === filterStatus.toUpperCase()
    const matchesCategory = filterCategory === 'all' || customer.category.toLowerCase() === filterCategory.toLowerCase()
    const matchesLocality = filterLocality === 'all' || customer.locality_id.toString() === filterLocality
    const matchesServiceType = filterServiceType === 'both' || customer.service_type === filterServiceType
    const matchesExpiryDate = !filterExpiryDate || customer.expiry_date === filterExpiryDate
    const matchesLetter = selectedLetter === 'All' || customer.full_name.toUpperCase().startsWith(selectedLetter)
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocality && matchesServiceType && matchesExpiryDate && matchesLetter
  })

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
        <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
        <button
          onClick={() => navigate('/admin/customers/add')}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={filterLocality}
              onChange={(e) => setFilterLocality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Locations</option>
              {localities.map(locality => (
                <option key={locality.id} value={locality.id}>{locality.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={filterExpiryDate}
              onChange={(e) => setFilterExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="both">Both</option>
              <option value="BROADBAND">Broadband</option>
              <option value="CABLE_TV">Cable TV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-teal-600 p-1 rounded">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-3 mb-4">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedLetter('All')}
            className={`px-3 py-1 text-sm rounded ${selectedLetter === 'All' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1 text-sm rounded ${selectedLetter === letter ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cust ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cust Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Received</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Exp. Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Loading...' : 'Showing 1 to 0 of 0 entries'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.customer_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.full_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.mobile}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.plan_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{customer.plan_amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{customer.received_amount || 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{customer.balance || 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString('en-GB').replace(/\//g, '/') : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleCollectPayment(customer)}
                          className="text-blue-600 hover:text-blue-800 p-1" 
                          title="Collect Payment"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewTransactions(customer)}
                          className="text-teal-600 hover:text-teal-800 p-1" 
                          title="View Transactions"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCustomer(customer)}
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleRenewSubscription(customer)}
                          className="text-purple-600 hover:text-purple-800 p-1" 
                          title="Renew Subscription"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleSendPaymentLink(customer)}
                          className="text-indigo-600 hover:text-indigo-800 p-1" 
                          title="Send Payment Link"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCreateComplaint(customer)}
                          className="text-orange-600 hover:text-orange-800 p-1" 
                          title="Create Complaint"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleSendWhatsApp(customer)}
                          className="text-green-600 hover:text-green-800 p-1" 
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleSendInvoice(customer)}
                          className="text-yellow-600 hover:text-yellow-800 p-1" 
                          title="Send Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(customer)}
                          className="text-red-600 hover:text-red-800 p-1" 
                          title="Delete Customer"
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
        
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredCustomers.length} of {filteredCustomers.length} entries
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Records:</label>
            <select className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button disabled className="px-3 py-1 bg-gray-200 text-gray-500 rounded text-sm cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
              Next
            </button>
          </div>
        </div>
      </div>

      <SendInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false)
          setSelectedCustomer(null)
        }}
        preSelectedCustomer={selectedCustomer}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete customer "{customerToDelete?.full_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setCustomerToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
