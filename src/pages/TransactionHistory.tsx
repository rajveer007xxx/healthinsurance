import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import api from '../utils/api'
import { Download } from 'lucide-react'

interface Transaction {
  id: number
  transaction_id: string
  customer_id: number
  customer_name: string
  customer_phone: string
  collected_by: number
  collector_name: string
  transaction_type: string
  amount: number
  balance_after: number
  description: string
  transaction_date: string
  created_at: string
}

interface Locality {
  id: number
  name: string
}

interface Employee {
  id: number
  name: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceType, setServiceType] = useState('ALL')
  const [locality, setLocality] = useState('ALL')
  const [mode, setMode] = useState('ALL')
  const [employee, setEmployee] = useState('ALL')
  const [financialYear, setFinancialYear] = useState('2025-2026')
  const [alphabetFilter, setAlphabetFilter] = useState('ALL')
  const [entriesPerPage, setEntriesPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transactionsRes, localitiesRes, employeesRes] = await Promise.all([
        api.get('/payments/'),
        api.get('/localities/'),
        api.get('/users/')
      ])
      setTransactions(transactionsRes.data)
      setLocalities(localitiesRes.data)
      setEmployees(employeesRes.data.filter((user: any) => user.role === 'ADMIN' || user.role === 'EMPLOYEE'))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesServiceType = serviceType === 'ALL' || true
    const matchesLocality = locality === 'ALL' || true
    const matchesMode = mode === 'ALL' || transaction.transaction_type === mode
    const matchesEmployee = employee === 'ALL' || transaction.collector_name === employee
    const matchesAlphabet = alphabetFilter === 'ALL' || 
      (transaction.customer_name && transaction.customer_name[0].toUpperCase() === alphabetFilter)
    
    return matchesSearch && matchesServiceType && matchesLocality && matchesMode && matchesEmployee && matchesAlphabet
  })

  const totalCollection = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

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

  const downloadReceipt = async (transactionId: string) => {
    try {
      const response = await api.get(`/payments/receipt/${transactionId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt_${transactionId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading receipt:', error)
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total Collection: <span className="font-bold text-green-600">{formatAmount(totalCollection)}</span>
            </p>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              >
                <option value="ALL">All</option>
                <option value="BROADBAND">Broadband</option>
                <option value="CABLE_TV">Cable TV</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              >
                <option value="ALL">All</option>
                {localities.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              >
                <option value="ALL">All</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              >
                <option value="ALL">All</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#448996] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAlphabetFilter('ALL')}
              className={`px-3 py-1 rounded ${alphabetFilter === 'ALL' ? 'bg-[#448996] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setAlphabetFilter(letter)}
                className={`px-3 py-1 rounded ${alphabetFilter === letter ? 'bg-[#448996] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#448996] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Collected/Added</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">After Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.transaction_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.transaction_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.description || `${transaction.customer_name} (${transaction.customer_phone})`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.collector_name || 'Admin'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(transaction.balance_after)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => downloadReceipt(transaction.transaction_id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#448996] text-white rounded hover:bg-[#357580] transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                          Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} entries
              </span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-[#448996] text-white border-[#448996]'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
