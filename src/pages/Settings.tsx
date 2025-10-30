import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { Save, Building, MapPin, CreditCard, Bell, Mail, MessageSquare, Plus, Edit, Trash, X, Upload } from 'lucide-react'
import api from '../utils/api'

interface Locality {
  id: number
  name: string
  city: string
  state: string
  pincode: string
}

const indianStates = [
  { name: 'Andaman and Nicobar Islands', code: '35' },
  { name: 'Andhra Pradesh', code: '37' },
  { name: 'Arunachal Pradesh', code: '12' },
  { name: 'Assam', code: '18' },
  { name: 'Bihar', code: '10' },
  { name: 'Chandigarh', code: '04' },
  { name: 'Chhattisgarh', code: '22' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
  { name: 'Delhi', code: '07' },
  { name: 'Goa', code: '30' },
  { name: 'Gujarat', code: '24' },
  { name: 'Haryana', code: '06' },
  { name: 'Himachal Pradesh', code: '02' },
  { name: 'Jammu and Kashmir', code: '01' },
  { name: 'Jharkhand', code: '20' },
  { name: 'Karnataka', code: '29' },
  { name: 'Kerala', code: '32' },
  { name: 'Ladakh', code: '38' },
  { name: 'Lakshadweep', code: '31' },
  { name: 'Madhya Pradesh', code: '23' },
  { name: 'Maharashtra', code: '27' },
  { name: 'Manipur', code: '14' },
  { name: 'Meghalaya', code: '17' },
  { name: 'Mizoram', code: '15' },
  { name: 'Nagaland', code: '13' },
  { name: 'Odisha', code: '21' },
  { name: 'Puducherry', code: '34' },
  { name: 'Punjab', code: '03' },
  { name: 'Rajasthan', code: '08' },
  { name: 'Sikkim', code: '11' },
  { name: 'Tamil Nadu', code: '33' },
  { name: 'Telangana', code: '36' },
  { name: 'Tripura', code: '16' },
  { name: 'Uttar Pradesh', code: '09' },
  { name: 'Uttarakhand', code: '05' },
  { name: 'West Bengal', code: '19' }
];

export default function Settings() {
  const [settings, setSettings] = useState({
    company_name: 'ispbilling.in',
    company_logo: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_gst: '',
    company_state: '',
    company_code: '',
    state_code: '',
    invoice_prefix: 'INV',
    enable_sms: true,
    enable_email: true,
    enable_whatsapp: true,
    declaration: '',
    terms_and_conditions: '',
    bank_name: '',
    account_number: '',
    branch_ifsc: ''
  })

  const [showLocalityModal, setShowLocalityModal] = useState(false)
  const [showLocalityForm, setShowLocalityForm] = useState(false)
  const [localities, setLocalities] = useState<Locality[]>([])
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null)
  const [localityForm, setLocalityForm] = useState({ name: '', city: '', state: '', pincode: '' })

  useEffect(() => {
    fetchSettings()
    
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

  useEffect(() => {
    if (showLocalityModal) {
      fetchLocalities()
    }
  }, [showLocalityModal])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/')
      if (response.data) {
        const stateCode = indianStates.find(s => s.name === response.data.company_state)?.code || '';
        setSettings({
          company_name: response.data.company_name || 'ispbilling.in',
          company_logo: response.data.company_logo || '',
          company_address: response.data.company_address || '',
          company_phone: response.data.company_phone || '',
          company_email: response.data.company_email || '',
          company_gst: response.data.company_gst || '',
          company_state: response.data.company_state || '',
          company_code: response.data.company_code || '',
          state_code: stateCode,
          invoice_prefix: response.data.invoice_prefix || 'INV',
          enable_sms: response.data.enable_sms ?? true,
          enable_email: response.data.enable_email ?? true,
          enable_whatsapp: response.data.enable_whatsapp ?? true,
          declaration: response.data.declaration || '',
          terms_and_conditions: response.data.terms_and_conditions || '',
          bank_name: response.data.bank_name || '',
          account_number: response.data.account_number || '',
          branch_ifsc: response.data.branch_ifsc || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await api.post('/api/upload/company-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setSettings({ ...settings, company_logo: response.data.logo_url })
      alert('Company logo uploaded successfully!')
      fetchSettings()
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo')
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

  const handleSave = async () => {
    try {
      await api.put('/settings/', settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    }
  }

  const handleAddLocality = () => {
    setEditingLocality(null)
    setLocalityForm({ name: '', city: '', state: '', pincode: '' })
    setShowLocalityForm(true)
  }

  const handleEditLocality = (locality: Locality) => {
    setEditingLocality(locality)
    setLocalityForm({ name: locality.name, city: locality.city, state: locality.state, pincode: locality.pincode })
    setShowLocalityForm(true)
  }

  const handleSaveLocality = async () => {
    try {
      if (editingLocality) {
        await api.put(`/localities/${editingLocality.id}`, localityForm)
        alert('Locality updated successfully!')
      } else {
        await api.post('/localities/', localityForm)
        alert('Locality added successfully!')
      }
      setLocalityForm({ name: '', city: '', state: '', pincode: '' })
      setEditingLocality(null)
      setShowLocalityForm(false)
      fetchLocalities()
    } catch (error) {
      console.error('Error saving locality:', error)
      alert('Error saving locality')
    }
  }

  const handleDeleteLocality = async (id: number) => {
    if (!confirm('Are you sure you want to delete this locality?')) return
    try {
      await api.delete(`/localities/${id}`)
      alert('Locality deleted successfully!')
      fetchLocalities()
    } catch (error) {
      console.error('Error deleting locality:', error)
      alert('Error deleting locality')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">Configure your system settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="bg-white shadow  p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Company Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center overflow-hidden mb-3 ">
                  {settings.company_logo ? (
                    <img src={`http://82.29.162.153:8002${settings.company_logo}`} alt="Company Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-[#448996] text-white px-4 py-2  hover:bg-[#336677] flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
                {settings.company_code && (
                  <p className="mt-1 text-sm text-gray-600">
                    Company ID: <span className="font-semibold">{settings.company_code}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={settings.company_address}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={settings.company_gst}
                  onChange={(e) => setSettings({ ...settings, company_gst: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={settings.company_state || ''}
                  onChange={(e) => {
                    const selectedState = e.target.value;
                    const stateCode = indianStates.find(s => s.name === selectedState)?.code || '';
                    setSettings({ ...settings, company_state: selectedState, state_code: stateCode });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 "
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state.code} value={state.name}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State Code (GST)</label>
                <input
                  type="text"
                  value={settings.state_code || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300   cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white shadow  p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Invoice Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoice_prefix}
                  onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Declaration</label>
                <textarea
                  value={settings.declaration}
                  onChange={(e) => setSettings({ ...settings, declaration: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 "
                  placeholder="Enter declaration text for invoices"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms and Conditions</label>
                <textarea
                  value={settings.terms_and_conditions}
                  onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 "
                  placeholder="Enter terms and conditions for invoices"
                />
              </div>

              <div className="pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Bank Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settings.bank_name}
                      onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">A/c No.</label>
                    <input
                      type="text"
                      value={settings.account_number}
                      onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch & IFS Code</label>
                    <input
                      type="text"
                      value={settings.branch_ifsc}
                      onChange={(e) => setSettings({ ...settings, branch_ifsc: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 "
                      placeholder="Enter branch and IFSC code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow  p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_sms}
                  onChange={(e) => setSettings({ ...settings, enable_sms: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Enable SMS Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_email}
                  onChange={(e) => setSettings({ ...settings, enable_email: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Enable Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_whatsapp}
                  onChange={(e) => setSettings({ ...settings, enable_whatsapp: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Enable WhatsApp Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Locality & Company Management */}
          <div className="bg-white shadow  p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowLocalityModal(true)}
                className="block w-full px-4 py-2 bg-[#448996] text-white  hover:bg-[#336677] text-center"
              >
                Manage Localities
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-[#448996] text-white  hover:bg-[#336677]"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </button>
        </div>
      </div>

      {/* Locality Management Modal */}
      {showLocalityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold">Manage Localities</h2>
              <button onClick={() => setShowLocalityModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <button
                  onClick={handleAddLocality}
                  className="flex items-center px-4 py-2 bg-[#448996] text-white  hover:bg-[#336677]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Locality
                </button>
              </div>

              {showLocalityForm && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4  mb-4">
                  <h3 className="font-semibold mb-3">{editingLocality ? 'Edit Locality' : 'Add New Locality'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Locality Name *</label>
                      <input
                        type="text"
                        value={localityForm.name}
                        onChange={(e) => setLocalityForm({ ...localityForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={localityForm.city}
                        onChange={(e) => setLocalityForm({ ...localityForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={localityForm.state}
                        onChange={(e) => setLocalityForm({ ...localityForm, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={localityForm.pincode}
                        onChange={(e) => setLocalityForm({ ...localityForm, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 "
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSaveLocality}
                      className="px-4 py-2 bg-[#448996] text-white  hover:bg-[#336677]"
                    >
                      {editingLocality ? 'Update' : 'Add'} Locality
                    </button>
                    <button
                      onClick={() => {
                        setEditingLocality(null)
                        setLocalityForm({ name: '', city: '', state: '', pincode: '' })
                        setShowLocalityForm(false)
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locality Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {localities.map((locality, index) => (
                      <tr key={locality.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{locality.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{locality.city}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{locality.state}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{locality.pincode}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditLocality(locality)}
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLocality(locality.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
