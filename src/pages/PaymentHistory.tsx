import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import api from '../utils/api'

interface Transaction {
  id: number
  date: string
  transactionId: string
  type: string
  description: string
  collectedBy: string
  amount: number
  afterBalance: number
}

const PaymentHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCollection, setTotalCollection] = useState(0)
  const [filters, setFilters] = useState({
    serviceType: 'Both',
    locality: 'All',
    mode: 'All',
    employee: 'All',
    financialYear: '2025-2026',
    search: ''
  })
  const [selectedLetter, setSelectedLetter] = useState('All')

  useEffect(() => {
    fetchTransactions()
  }, [filters, selectedLetter])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions', { params: { ...filters, letter: selectedLetter } })
      setTransactions(response.data.transactions || [])
      setTotalCollection(response.data.totalCollection || 0)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Payment History</h1>
        <div className="text-xl font-semibold text-green-600">
          Total Collection: ₹{totalCollection.toFixed(2)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            value={filters.serviceType}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>Both</option>
            <option>Broadband</option>
            <option>Cable TV</option>
          </select>

          <select
            value={filters.locality}
            onChange={(e) => setFilters({ ...filters, locality: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All</option>
            <option>COLLECTORATE</option>
          </select>

          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All</option>
            <option>Online</option>
            <option>Offline</option>
          </select>

          <select
            value={filters.employee}
            onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>All</option>
          </select>

          <select
            value={filters.financialYear}
            onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-isp-teal"
          >
            <option>2025-2026</option>
            <option>2024-2025</option>
            <option>2023-2024</option>
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
              <th className="px-4 py-3 text-center">Sl. No.</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Transaction ID</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Collected/Added</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">After Balance</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center border-r border-gray-200">{index + 1}</td>
                  <td className="px-4 py-3">{transaction.date}</td>
                  <td className="px-4 py-3">{transaction.transactionId}</td>
                  <td className="px-4 py-3">{transaction.type}</td>
                  <td className="px-4 py-3">{transaction.description}</td>
                  <td className="px-4 py-3">{transaction.collectedBy}</td>
                  <td className="px-4 py-3">₹{transaction.amount}</td>
                  <td className="px-4 py-3">₹{transaction.afterBalance}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button className="p-1 hover:bg-gray-200 rounded" title="Download Receipt">
                        <Download className="w-4 h-4 text-blue-600" />
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
  )
}

export default PaymentHistory
