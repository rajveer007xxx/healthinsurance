import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import api from '../utils/api'
import { Mail, Plus, Trash2, Send } from 'lucide-react'

interface InvoiceItem {
  sl_no: number
  particulars: string
  hsn_code: string
  quantity: number
  price: number
  final_price: number
}

export default function SendInvoices() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_company: '',
    buyer_contact: '',
    buyer_email: '',
    buyer_address: '',
    buyer_city: '',
    buyer_state: '',
    buyer_gst: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cgst: 0,
    sgst: 0,
    igst: 0,
  })
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { sl_no: 1, particulars: '', hsn_code: '', quantity: 1, price: 0, final_price: 0 }
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].final_price = newItems[index].quantity * newItems[index].price
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { 
      sl_no: items.length + 1, 
      particulars: '', 
      hsn_code: '', 
      quantity: 1, 
      price: 0, 
      final_price: 0 
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      newItems.forEach((item, i) => item.sl_no = i + 1)
      setItems(newItems)
    }
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.final_price, 0)
    const cgst = (subtotal * formData.cgst) / 100
    const sgst = (subtotal * formData.sgst) / 100
    const igst = (subtotal * formData.igst) / 100
    const total = subtotal + cgst + sgst + igst
    return { subtotal, cgst, sgst, igst, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.buyer_email || !formData.buyer_name) {
      alert('Please fill in buyer name and email')
      return
    }

    const totals = calculateTotal()
    
    const invoiceData = {
      ...formData,
      items: items,
      total_amount: totals.total,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst
    }

    try {
      setLoading(true)
      await api.post('/manual-invoices/', invoiceData)
      alert('Invoice sent successfully!')
      
      setFormData({
        buyer_name: '',
        buyer_company: '',
        buyer_contact: '',
        buyer_email: '',
        buyer_address: '',
        buyer_city: '',
        buyer_state: '',
        buyer_gst: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cgst: 0,
        sgst: 0,
        igst: 0,
      })
      setItems([{ sl_no: 1, particulars: '', hsn_code: '', quantity: 1, price: 0, final_price: 0 }])
    } catch (error: any) {
      console.error('Error sending invoice:', error)
      alert(error.response?.data?.detail || 'Failed to send invoice')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotal()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-6 w-6 text-[#448996]" />
              Send Manual Invoice
            </h1>
            <p className="text-sm text-gray-600 mt-1">Create and send custom invoices</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer Name *
                  </label>
                  <input
                    type="text"
                    name="buyer_name"
                    value={formData.buyer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="buyer_company"
                    value={formData.buyer_company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="buyer_contact"
                    value={formData.buyer_contact}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="buyer_email"
                    value={formData.buyer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="buyer_address"
                    value={formData.buyer_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="buyer_city"
                    value={formData.buyer_city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="buyer_state"
                    value={formData.buyer_state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="buyer_gst"
                    value={formData.buyer_gst}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    name="invoice_date"
                    value={formData.invoice_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-[#448996] text-white hover:bg-[#336677] font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.sl_no}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.particulars}
                            onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 text-sm"
                            required
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.hsn_code}
                            onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 text-sm"
                            min="1"
                            required
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 text-sm"
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ₹{item.final_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={items.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CGST (%)
                  </label>
                  <input
                    type="number"
                    name="cgst"
                    value={formData.cgst}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SGST (%)
                  </label>
                  <input
                    type="number"
                    name="sgst"
                    value={formData.sgst}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IGST (%)
                  </label>
                  <input
                    type="number"
                    name="igst"
                    value={formData.igst}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-[#448996] focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.cgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST ({formData.cgst}%):</span>
                    <span className="font-medium">₹{totals.cgst.toFixed(2)}</span>
                  </div>
                )}
                {totals.sgst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST ({formData.sgst}%):</span>
                    <span className="font-medium">₹{totals.sgst.toFixed(2)}</span>
                  </div>
                )}
                {totals.igst > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGST ({formData.igst}%):</span>
                    <span className="font-medium">₹{totals.igst.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#448996]">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#448996] text-white hover:bg-[#336677] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
