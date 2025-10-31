import AdminLayout from '../components/AdminLayout'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { DollarSign, History, Send, FileText, X } from 'lucide-react'

interface Customer {
  id: number
  customer_id: string
  full_name: string
  username: string
  phone: string
  address: string
  status: string
  plan_amount: number
  amount_paid: number
  balance: number
  expiry_date: string
  service_type: string
}

interface Payment {
  amount: number
  discount: number
  transaction_no: string
  payment_date: string
  payment_method: string
  remarks: string
}

export default function BillDues() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceFilter, setServiceFilter] = useState('broadband')
  const [localityFilter, setLocalityFilter] = useState('all')
  const [duesFilter, setDuesFilter] = useState('high_to_low')
  const [selectedLetter, setSelectedLetter] = useState('')
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const [paymentForm, setPaymentForm] = useState<Payment>({
    amount: 0,
    discount: 0,
    transaction_no: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    remarks: ''
  })

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  useEffect(() => {
    fetchDues()
  }, [serviceFilter, localityFilter, duesFilter])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault()
      }
    }
    
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const fetchDues = async () => {
    try {
      setLoading(true)
      const params: any = { status: 'active' }
      if (serviceFilter !== 'both') params.service_type = serviceFilter
      
      const response = await api.get('/customers/', { params })
      const customersWithDues = response.data.filter((c: Customer) => c.balance > 0)
      
      if (duesFilter === 'high_to_low') {
        customersWithDues.sort((a: Customer, b: Customer) => b.balance - a.balance)
      } else if (duesFilter === 'newest_dues') {
        customersWithDues.sort((a: Customer, b: Customer) => 
          new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()
        )
      }
      
      setCustomers(customersWithDues)
    } catch (error) {
      console.error('Error fetching dues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    if (selectedLetter && !customer.full_name.toUpperCase().startsWith(selectedLetter)) {
      return false
    }
    return true
  })

  const handlePayment = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPaymentForm({
      amount: customer.balance,
      discount: 0,
      transaction_no: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      remarks: ''
    })
    setShowPaymentModal(true)
  }

  const handleSubmitPayment = async () => {
    if (!selectedCustomer) return
    
    try {
      await api.post('/payments/', {
        customer_id: selectedCustomer.id,
        amount: paymentForm.amount,
        discount: paymentForm.discount,
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        transaction_id: paymentForm.transaction_no,
        remarks: paymentForm.remarks
      })
      
      alert('Payment collected successfully!')
      setShowPaymentModal(false)
      fetchDues()
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Error collecting payment')
    }
  }

  const handleViewTransactions = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowTransactionsModal(true)
  }

  const handleSendPaymentLink = (customer: Customer) => {
    setSelectedCustomer(customer)
    alert(`Payment link will be sent to ${customer.full_name}`)
  }

  const handleAddonBill = (customer: Customer) => {
    setSelectedCustomer(customer)
    alert(`Addon bill for ${customer.full_name}`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Bill Dues</h1>
          <div className="text-lg font-semibold text-red-600">
            Total Dues: ₹{customers.reduce((sum, c) => sum + c.balance, 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="broadband">Broadband</option>
                <option value="cable_tv">Cable TV</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
              <select
                value={localityFilter}
                onChange={(e) => setLocalityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Dues</label>
              <select
                value={duesFilter}
                onChange={(e) => setDuesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="high_to_low">High to Low</option>
                <option value="newest_dues">Newest Dues</option>
                <option value="advance_payment">Advance Payment</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter('')}
              className={`px-3 py-1 rounded text-sm font-medium ${!selectedLetter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1 rounded text-sm font-medium ${selectedLetter === letter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cust ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cust Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exp Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-4 text-center text-gray-500">No dues found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.customer_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.full_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{customer.plan_amount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{customer.amount_paid}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className="text-red-600 font-semibold cursor-pointer hover:underline">
                        ₹{customer.balance}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.expiry_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePayment(customer)}
                          className="text-green-600 hover:text-green-900"
                          title="Update Payment"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewTransactions(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Transactions"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendPaymentLink(customer)}
                          className="text-cyan-600 hover:text-cyan-900"
                          title="Send Payment Link"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddonBill(customer)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Addon Bill"
                        >
                          <FileText className="h-4 w-4" />
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

      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  value={selectedCustomer.full_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
                <input
                  type="text"
                  value={`₹${selectedCustomer.balance}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <input
                  type="number"
                  value={paymentForm.discount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction No</label>
                <input
                  type="text"
                  value={paymentForm.transaction_no}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_no: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="cash">Cash</option>
                  <option value="paytm">Paytm</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="googlepay">GooglePay</option>
                  <option value="cheque">Cheque</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitPayment}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Submit Payment
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTransactionsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transaction History - {selectedCustomer.full_name}</h2>
              <button onClick={() => setShowTransactionsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-gray-500">Transaction history will be displayed here</div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
