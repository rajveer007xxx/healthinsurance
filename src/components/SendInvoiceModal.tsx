import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import api from '../utils/api'

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
}

interface CompanySettings {
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  company_city: string
  company_state: string
  company_pincode: string
  company_gst_no: string
  bank_name: string
  bank_account_no: string
  bank_ifsc: string
  bank_branch: string
}

interface InvoiceItem {
  id: string
  sl_no: number
  particulars: string
  hsn_code: string
  units: number
  price: number
  amount: number
}

interface SendInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  preSelectedCustomer?: Customer | null
}

export default function SendInvoiceModal({ isOpen, onClose, preSelectedCustomer }: SendInvoiceModalProps) {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [manualCustomerName, setManualCustomerName] = useState('')
  const [manualCustomerDetails, setManualCustomerDetails] = useState('')
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', sl_no: 1, particulars: '', hsn_code: '', units: 1, price: 0, amount: 0 }
  ])
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Payment is due within 7 days from the invoice date.\n2. Late payments may incur additional charges.\n3. All disputes are subject to local jurisdiction.'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCompanySettings()
      fetchCustomers()
      generateInvoiceNumber()
      calculateDueDate(invoiceDate)
      
      if (preSelectedCustomer) {
        setSelectedCustomerId(preSelectedCustomer.id)
        setSelectedCustomer(preSelectedCustomer)
      }
    }
  }, [isOpen, preSelectedCustomer])

  useEffect(() => {
    if (invoiceDate) {
      calculateDueDate(invoiceDate)
    }
  }, [invoiceDate])

  const fetchCompanySettings = async () => {
    try {
      const response = await api.get('/settings/')
      setCompanySettings(response.data)
    } catch (error) {
      console.error('Error fetching company settings:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/')
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const generateInvoiceNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    setInvoiceNumber(`INV-${timestamp}-${random}`)
  }

  const calculateDueDate = (date: string) => {
    const invoiceDateObj = new Date(date)
    invoiceDateObj.setDate(invoiceDateObj.getDate() + 7)
    setDueDate(invoiceDateObj.toISOString().split('T')[0])
  }

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'manual') {
      setUseManualEntry(true)
      setSelectedCustomerId(null)
      setSelectedCustomer(null)
    } else {
      setUseManualEntry(false)
      const customer = customers.find(c => c.id === parseInt(customerId))
      setSelectedCustomerId(customer?.id || null)
      setSelectedCustomer(customer || null)
    }
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'units' || field === 'price') {
          updatedItem.amount = updatedItem.units * updatedItem.price
        }
        return updatedItem
      }
      return item
    }))
  }

  const addItem = () => {
    const newId = (Math.max(...items.map(i => parseInt(i.id))) + 1).toString()
    const newSlNo = items.length + 1
    setItems([...items, { id: newId, sl_no: newSlNo, particulars: '', hsn_code: '', units: 1, price: 0, amount: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const updatedItems = items.filter(item => item.id !== id)
      updatedItems.forEach((item, index) => {
        item.sl_no = index + 1
      })
      setItems(updatedItems)
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    if (num === 0) return 'Zero'

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return ''
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
    }

    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const remainder = num % 1000

    let result = ''
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore '
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh '
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand '
    if (remainder > 0) result += convertLessThanThousand(remainder)

    return result.trim() + ' Rupees Only'
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const invoiceData = {
        customer_id: useManualEntry ? null : selectedCustomerId,
        customer_name: useManualEntry ? manualCustomerName : selectedCustomer?.full_name,
        customer_details: useManualEntry ? manualCustomerDetails : `${selectedCustomer?.address}, ${selectedCustomer?.city}, ${selectedCustomer?.state} - ${selectedCustomer?.pincode}`,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        items: items.map(item => ({
          sl_no: item.sl_no,
          particulars: item.particulars,
          hsn_code: item.hsn_code,
          units: item.units,
          price: item.price,
          amount: item.amount
        })),
        total_amount: calculateTotal(),
        terms_and_conditions: termsAndConditions
      }

      await api.post('/manual-invoices/', invoiceData)
      alert('Invoice created and sent successfully!')
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const totalAmount = calculateTotal()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-teal-800 mb-3">Company Details</h3>
                {companySettings ? (
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-bold text-base">{companySettings.company_name}</p>
                    <p>{companySettings.company_address}</p>
                    <p>{companySettings.company_city}, {companySettings.company_state} - {companySettings.company_pincode}</p>
                    <p>Email: {companySettings.company_email}</p>
                    <p>Phone: {companySettings.company_phone}</p>
                    <p>GST No: {companySettings.company_gst_no}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading company details...</p>
                )}
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-teal-800 mb-4">INVOICE</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-end gap-2">
                    <span className="font-semibold">Invoice No:</span>
                    <span className="text-teal-700 font-mono">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="font-semibold">Date:</span>
                    <span>{new Date(invoiceDate).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Selection</label>
            <select
              value={useManualEntry ? 'manual' : selectedCustomerId || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {customer.customer_id} - {customer.mobile}
                </option>
              ))}
              <option value="manual">--- Enter Manually ---</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Bill To:</h4>
            {useManualEntry ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Details</label>
                  <textarea
                    value={manualCustomerDetails}
                    onChange={(e) => setManualCustomerDetails(e.target.value)}
                    placeholder="Enter customer address and other details"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            ) : selectedCustomer ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-bold text-base">{selectedCustomer.full_name}</p>
                <p>{selectedCustomer.address}</p>
                <p>{selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
                <p>Mobile: {selectedCustomer.mobile}</p>
                {selectedCustomer.email && <p>Email: {selectedCustomer.email}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Please select a customer from the dropdown above</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (7 days)</label>
              <input
                type="date"
                value={dueDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Due Amount</label>
              <input
                type="text"
                value={`₹${Math.round(totalAmount)}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-teal-50 font-bold text-teal-800"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">Invoice Items</h4>
              <button
                onClick={addItem}
                className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase w-16">Sl. No.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase">Particulars</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase w-24">HSN Code</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase w-24">Units</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase w-32">Price (₹)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase w-32">Amount (₹)</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-center font-semibold">{item.sl_no}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.particulars}
                          onChange={(e) => handleItemChange(item.id, 'particulars', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) => handleItemChange(item.id, 'hsn_code', e.target.value)}
                          placeholder="HSN Code"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.units}
                          onChange={(e) => handleItemChange(item.id, 'units', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        ₹{Math.round(item.amount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-right font-bold text-gray-800">Total Amount:</td>
                    <td className="px-3 py-3 font-bold text-teal-800 text-lg">₹{Math.round(totalAmount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-semibold text-gray-700">Amount in Words:</p>
              <p className="text-base font-bold text-gray-900">{numberToWords(Math.floor(totalAmount))}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
              {companySettings ? (
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm space-y-1">
                  <p><span className="font-semibold">Bank Name:</span> {companySettings.bank_name}</p>
                  <p><span className="font-semibold">Account No:</span> {companySettings.bank_account_no}</p>
                  <p><span className="font-semibold">IFSC Code:</span> {companySettings.bank_ifsc}</p>
                  <p><span className="font-semibold">Branch:</span> {companySettings.bank_branch}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Loading bank details...</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm font-semibold text-gray-700 mb-2">Authorized Signature</p>
                <div className="h-16 border-b-2 border-gray-400"></div>
                <p className="text-xs text-gray-600 mt-1 text-center">For {companySettings?.company_name}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !invoiceNumber || items.length === 0 || (!useManualEntry && !selectedCustomerId) || (useManualEntry && !manualCustomerName)}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Invoice...' : 'Create & Send Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
