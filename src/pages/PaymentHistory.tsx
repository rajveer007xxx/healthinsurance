import { useEffect, useState } from 'react'
import { Search, Download } from 'lucide-react'
import api from '../utils/api'

interface Transaction {
  id: number
  date: string
  transaction_id: string
  type: string
  description: string
  collected_added: string
  amount: number
  after_balance: number
}

interface Locality {
  id: number
  name: string
}

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterServiceType, setFilterServiceType] = useState('both')
  const [filterLocality, setFilterLocality] = useState('all')
  const [filterMode, setFilterMode] = useState('all')
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterFinancialYear, setFilterFinancialYear] = useState('2025-2026')
  const [selectedLetter, setSelectedLetter] = useState('All')

  useEffect(() => {
    fetchTransactions()
    fetchLocalities()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/')
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLetter = selectedLetter === 'All' || transaction.description.toUpperCase().startsWith(selectedLetter)
    return matchesSearch && matchesLetter
  })

  const totalCollection = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

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
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <div className="text-lg font-semibold text-green-600">
          Total Collection: ₹{totalCollection.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="broadband">Broadband</option>
              <option value="cable_tv">Cable TV</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
            <select
              value={filterLocality}
              onChange={(e) => setFilterLocality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All</option>
              {localities.map(locality => (
                <option key={locality.id} value={locality.id}>{locality.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
            <select
              value={filterFinancialYear}
              onChange={(e) => setFilterFinancialYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
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
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Sl. No.</th>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.collected_added || 'Admin'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.after_balance}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button className="text-teal-600 hover:text-teal-800 p-1" title="Download Receipt">
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing 1 to {filteredTransactions.length} of {filteredTransactions.length} entries
          </div>
          <div className="flex items-center gap-2">
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
    </div>
  )
}
