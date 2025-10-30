import React, { useEffect, useState } from 'react'
import { X, DollarSign, Eye, Edit, RefreshCw, Send, MessageSquare, Phone, FileText, Trash2 } from 'lucide-react'
import api from '../utils/api'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  mobile: string
  status: string
  plan: {
    name: string
    price: number
  }
  balance_amount: number
  end_date: string
}

interface Transaction {
  id: number
  transaction_id: string
  transaction_type: string
  amount: number
  description: string
  created_by: string
  created_at: string
  balance_after: number
}

const Userlist: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    locality: 'All Locations',
    categoryType: 'All Categories',
    expiryDate: '',
    status: 'All',
    serviceType: 'Both',
    search: ''
  })
  const [selectedLetter, setSelectedLetter] = useState('All')
  const [recordsPerPage, setRecordsPerPage] = useState(25)
  
  const [showCollectPayment, setShowCollectPayment] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)
  const [showEditCustomer, setShowEditCustomer] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    discount: 0,
    transactionNo: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    remarks: ''
  })
  
  const [editTab, setEditTab] = useState(1)
  const [editForm, setEditForm] = useState({
    customer_id: '',
    username: '',
    full_name: '',
    nickname: '',
    email: '',
    phone: '',
    mobile: '',
    alternate_mobile: '',
    id_proof_type: 'AADHAR_CARD',
    id_proof_no: '',
    customer_gst_no: '',
    customer_state_code: '',
    house_number: '',
    locality_id: '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    service_type: 'BROADBAND',
    billing_type: 'PREPAID',
    caf_no: '',
    mac_address: '',
    mac_address_detail: '',
    ip_address: '',
    vendor: '',
    modem_no: '',
    modem_no_detail: '',
    gst_invoice_needed: 'No',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchCustomers()
  }, [filters, selectedLetter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params: any = {}
      
      if (filters.status !== 'All') params.status = filters.status.toUpperCase()
      if (filters.serviceType !== 'Both') params.service_type = filters.serviceType.toUpperCase().replace(' ', '_')
      if (filters.search) params.search = filters.search
      
      const response = await api.get('/customers', { params })
      setCustomers(response.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTransactionNo = () => {
    return 'TXN' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
  }

  const handleCollectPayment = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPaymentForm({
      amount: customer.balance_amount,
      discount: 0,
      transactionNo: generateTransactionNo(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      remarks: ''
    })
    setShowCollectPayment(true)
  }

  const handleViewTransactions = async (customer: Customer) => {
    setSelectedCustomer(customer)
    try {
      const response = await api.get(`/transactions?customer_id=${customer.id}`)
      setTransactions(response.data)
      setShowTransactions(true)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      alert('Failed to load transactions')
    }
  }

  const handleEditCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer)
    try {
      const response = await api.get(`/customers/${customer.id}`)
      const data = response.data
      setEditForm({
        customer_id: data.customer_id || '',
        username: data.username || '',
        full_name: data.full_name || '',
        nickname: data.nickname || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        alternate_mobile: data.alternate_mobile || '',
        id_proof_type: data.id_proof_type || 'AADHAR_CARD',
        id_proof_no: data.id_proof_no || '',
        customer_gst_no: data.customer_gst_no || '',
        customer_state_code: data.customer_state_code || '',
        house_number: data.house_number || '',
        locality_id: data.locality_id || '',
        address: data.address || '',
        state: data.state || '',
        city: data.city || '',
        pincode: data.pincode || '',
        service_type: data.service_type || 'BROADBAND',
        billing_type: data.billing_type || 'PREPAID',
        caf_no: data.caf_no || '',
        mac_address: data.mac_address || '',
        mac_address_detail: data.mac_address_detail || '',
        ip_address: data.ip_address || '',
        vendor: data.vendor || '',
        modem_no: data.modem_no || '',
        modem_no_detail: data.modem_no_detail || '',
        gst_invoice_needed: 'No',
        status: data.status || 'ACTIVE'
      })
      setEditTab(1)
      setShowEditCustomer(true)
    } catch (error) {
      console.error('Failed to fetch customer details:', error)
      alert('Failed to load customer details')
    }
  }

  const submitPayment = async () => {
    if (!selectedCustomer) return
    
    try {
      await api.post('/payments', {
        customer_id: selectedCustomer.id,
        amount: paymentForm.amount - paymentForm.discount,
        payment_method: paymentForm.paymentMethod,
        payment_reference: paymentForm.transactionNo,
        remarks: paymentForm.remarks
      })
      alert('Payment collected successfully!')
      setShowCollectPayment(false)
      fetchCustomers()
    } catch (error) {
      console.error('Failed to collect payment:', error)
      alert('Failed to collect payment')
    }
  }

  const submitEditCustomer = async () => {
    if (!selectedCustomer) return
    
    try {
      await api.put(`/customers/${selectedCustomer.id}`, editForm)
      alert('Customer updated successfully!')
      setShowEditCustomer(false)
      fetchCustomers()
    } catch (error) {
      console.error('Failed to update customer:', error)
      alert('Failed to update customer')
    }
  }

  const handleRenewSubscription = async (customer: Customer) => {
    if (confirm(`Renew subscription for ${customer.full_name}?`)) {
      try {
        await api.post(`/customers/${customer.id}/renew`)
        alert('Subscription renewed successfully!')
        fetchCustomers()
      } catch (error) {
        console.error('Failed to renew subscription:', error)
        alert('Failed to renew subscription')
      }
    }
  }

  const handleSendPaymentLink = async (customer: Customer) => {
    try {
      await api.post(`/customers/${customer.id}/send-payment-link`)
      alert('Payment link sent successfully!')
    } catch (error) {
      console.error('Failed to send payment link:', error)
      alert('Failed to send payment link')
    }
  }

  const handleCreateComplaint = async (customer: Customer) => {
    const title = prompt('Enter complaint title:')
    if (!title) return
    
    const description = prompt('Enter complaint description:')
    if (!description) return
    
    try {
      await api.post('/complaints', {
        customer_id: customer.id,
        title,
        description,
        category: 'GENERAL',
        priority: 'MEDIUM'
      })
      alert('Complaint created successfully!')
    } catch (error) {
      console.error('Failed to create complaint:', error)
      alert('Failed to create complaint')
    }
  }

  const handleSendWhatsApp = async (customer: Customer) => {
    const message = prompt(`Send WhatsApp message to ${customer.full_name}:`)
    if (!message) return
    
    try {
      await api.post(`/customers/${customer.id}/send-whatsapp`, { message })
      alert('WhatsApp message sent successfully!')
    } catch (error) {
      console.error('Failed to send WhatsApp:', error)
      alert('Failed to send WhatsApp message')
    }
  }

  const handleAddonBill = async (_customer: Customer) => {
    alert('Addon Bill feature - Coming soon')
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.full_name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/customers/${customer.id}`)
        alert('Customer deleted successfully!')
        fetchCustomers()
      } catch (error) {
        console.error('Failed to delete customer:', error)
        alert('Failed to delete customer')
      }
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Customer List</h1>
        <button className="bg-isp-teal text-white px-6 py-2 rounded-lg hover:bg-isp-accent transition-colors">
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            value={filters.locality}
            onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All Locations</option>
            <option>COLLECTORATE</option>
          </select>

          <select
            value={filters.categoryType}
            onChange={(e) => setFilters({ ...filters, categoryType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All Categories</option>
            <option>Prepaid</option>
            <option>Postpaid</option>
          </select>

          <input
            type="date"
            value={filters.expiryDate}
            onChange={(e) => setFilters({ ...filters, expiryDate: e.target.value })}
            placeholder="Expiry Date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>

          <select
            value={filters.serviceType}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>Both</option>
            <option>Broadband</option>
            <option>Cable TV</option>
          </select>

          <div className="flex">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-isp-teal"
            />
            <button className="bg-isp-teal text-white px-4 rounded-r-lg hover:bg-isp-accent">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLetter('All')}
            className={`px-3 py-1 rounded ${selectedLetter === 'All' ? 'bg-isp-teal text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-3 py-1 rounded ${selectedLetter === letter ? 'bg-isp-teal text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-isp-teal text-white">
            <tr>
              <th className="px-4 py-3 text-left">Cust ID</th>
              <th className="px-4 py-3 text-left">Cust Name</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Received</th>
              <th className="px-4 py-3 text-left">Balance</th>
              <th className="px-4 py-3 text-left">Exp. Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{customer.customer_id}</td>
                  <td className="px-4 py-3">{customer.full_name}</td>
                  <td className="px-4 py-3">{customer.mobile}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      customer.status === 'DEACTIVE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{customer.plan?.name || 'N/A'}</td>
                  <td className="px-4 py-3">₹{customer.plan?.price || 0}</td>
                  <td className="px-4 py-3">₹{(customer.plan?.price || 0) - customer.balance_amount}</td>
                  <td className="px-4 py-3">₹{customer.balance_amount}</td>
                  <td className="px-4 py-3">{new Date(customer.end_date).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        onClick={() => handleCollectPayment(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Collect Payment"
                      >
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </button>
                      <button 
                        onClick={() => handleViewTransactions(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="View Transactions"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button 
                        onClick={() => handleRenewSubscription(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Renew Subscription"
                      >
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                      </button>
                      <button 
                        onClick={() => handleSendPaymentLink(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Send Payment Link"
                      >
                        <Send className="w-4 h-4 text-teal-600" />
                      </button>
                      <button 
                        onClick={() => handleCreateComplaint(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Create Complaint"
                      >
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                      </button>
                      <button 
                        onClick={() => handleSendWhatsApp(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Send WhatsApp"
                      >
                        <Phone className="w-4 h-4 text-green-500" />
                      </button>
                      <button 
                        onClick={() => handleAddonBill(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Addon Bill"
                      >
                        <FileText className="w-4 h-4 text-cyan-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomer(customer)}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Records per page:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => setRecordsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
              Previous
            </button>
            <button className="px-3 py-1 bg-isp-teal text-white rounded">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>

      {showCollectPayment && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Collect Payment</h2>
              <button onClick={() => setShowCollectPayment(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input type="text" value={selectedCustomer.full_name} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
                <input type="text" value={`₹${selectedCustomer.balance_amount}`} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <input type="number" value={paymentForm.discount} onChange={(e) => setPaymentForm({ ...paymentForm, discount: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction No</label>
                <input type="text" value={paymentForm.transactionNo} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required>
                  <option value="CASH">Cash</option>
                  <option value="PAYTM">Paytm</option>
                  <option value="PHONEPE">PhonePe</option>
                  <option value="GOOGLEPAY">GooglePay</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" rows={3} />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t">
              <button onClick={() => setShowCollectPayment(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
              <button onClick={submitPayment} className="px-4 py-2 bg-isp-teal text-white rounded-lg hover:bg-isp-accent">Submit Payment</button>
            </div>
          </div>
        </div>
      )}

      {showTransactions && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Transaction History - {selectedCustomer.full_name}</h2>
              <button onClick={() => setShowTransactions(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Collected/Added</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">After Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No transactions found</td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(txn.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3 text-sm">{txn.transaction_id}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${txn.transaction_type === 'PAYMENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {txn.transaction_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{txn.description}</td>
                        <td className="px-4 py-3 text-sm">{txn.created_by || 'Admin'}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{txn.amount}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{txn.balance_after}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t">
              <button onClick={() => setShowTransactions(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {showEditCustomer && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Edit Customer - {selectedCustomer.full_name}</h2>
              <button onClick={() => setShowEditCustomer(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b">
              <button onClick={() => setEditTab(1)} className={`px-6 py-3 font-medium ${editTab === 1 ? 'border-b-2 border-isp-teal text-isp-teal' : 'text-gray-500'}`}>General Info</button>
              <button onClick={() => setEditTab(2)} className={`px-6 py-3 font-medium ${editTab === 2 ? 'border-b-2 border-isp-teal text-isp-teal' : 'text-gray-500'}`}>Address Details</button>
              <button onClick={() => setEditTab(3)} className={`px-6 py-3 font-medium ${editTab === 3 ? 'border-b-2 border-isp-teal text-isp-teal' : 'text-gray-500'}`}>Billing Details</button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 py-4">
              {editTab === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                    <input type="text" value={editForm.customer_id} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                    <input type="text" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                    <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
                    <input type="text" value={editForm.alternate_mobile} onChange={(e) => setEditForm({ ...editForm, alternate_mobile: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                    <select value={editForm.id_proof_type} onChange={(e) => setEditForm({ ...editForm, id_proof_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal">
                      <option value="AADHAR_CARD">Aadhar Card</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number</label>
                    <input type="text" value={editForm.id_proof_no} onChange={(e) => setEditForm({ ...editForm, id_proof_no: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer GST No</label>
                    <input type="text" value={editForm.customer_gst_no} onChange={(e) => setEditForm({ ...editForm, customer_gst_no: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer State Code</label>
                    <input type="text" value={editForm.customer_state_code} onChange={(e) => setEditForm({ ...editForm, customer_state_code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                </div>
              )}

              {editTab === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                    <input type="text" value={editForm.house_number} onChange={(e) => setEditForm({ ...editForm, house_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                    <select value={editForm.locality_id} onChange={(e) => setEditForm({ ...editForm, locality_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal">
                      <option value="">Select Locality</option>
                      <option value="1">COLLECTORATE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal">
                      <option value="">Select State</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal">
                      <option value="">Select City</option>
                      <option value="Bhopal">Bhopal</option>
                      <option value="Indore">Indore</option>
                      <option value="Jabalpur">Jabalpur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input type="text" value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" maxLength={6} />
                  </div>
                </div>
              )}

              {editTab === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                    <select value={editForm.service_type} onChange={(e) => setEditForm({ ...editForm, service_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required>
                      <option value="BROADBAND">Broadband</option>
                      <option value="CABLE_TV">Cable TV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Type *</label>
                    <select value={editForm.billing_type} onChange={(e) => setEditForm({ ...editForm, billing_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required>
                      <option value="PREPAID">Prepaid</option>
                      <option value="POSTPAID">Postpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAF No</label>
                    <input type="text" value={editForm.caf_no} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                    <input type="text" value={editForm.mac_address} onChange={(e) => setEditForm({ ...editForm, mac_address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address Detail</label>
                    <input type="text" value={editForm.mac_address_detail} onChange={(e) => setEditForm({ ...editForm, mac_address_detail: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <input type="text" value={editForm.ip_address} onChange={(e) => setEditForm({ ...editForm, ip_address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <input type="text" value={editForm.vendor} onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modem No</label>
                    <input type="text" value={editForm.modem_no} onChange={(e) => setEditForm({ ...editForm, modem_no: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modem No Detail</label>
                    <input type="text" value={editForm.modem_no_detail} onChange={(e) => setEditForm({ ...editForm, modem_no_detail: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Invoice Needed</label>
                    <select value={editForm.gst_invoice_needed} onChange={(e) => setEditForm({ ...editForm, gst_invoice_needed: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal" required>
                      <option value="ACTIVE">Active</option>
                      <option value="DEACTIVE">Deactive</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex space-x-2">
                {editTab > 1 && (
                  <button onClick={() => setEditTab(editTab - 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Previous</button>
                )}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setShowEditCustomer(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
                {editTab < 3 ? (
                  <button onClick={() => setEditTab(editTab + 1)} className="px-4 py-2 bg-isp-teal text-white rounded-lg hover:bg-isp-accent">Next</button>
                ) : (
                  <button onClick={submitEditCustomer} className="px-4 py-2 bg-isp-teal text-white rounded-lg hover:bg-isp-accent">Update Customer</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Userlist
