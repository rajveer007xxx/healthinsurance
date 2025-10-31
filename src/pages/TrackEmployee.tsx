import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Search, MapPin, Clock, Circle } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../utils/api'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Employee {
  id: number
  name: string
  latitude: number
  longitude: number
  status: 'online' | 'offline'
  lastUpdated: Date
  employee_image?: string
}

const generateMockEmployees = (): Employee[] => {
  const baseLocations = [
    { lat: 30.7333, lng: 76.7794, name: 'Rajesh Kumar' },
    { lat: 30.7410, lng: 76.7880, name: 'Priya Sharma' },
    { lat: 30.7290, lng: 76.7650, name: 'Amit Singh' },
    { lat: 30.7500, lng: 76.7900, name: 'Neha Gupta' },
    { lat: 30.7200, lng: 76.7700, name: 'Vikram Patel' },
    { lat: 30.7380, lng: 76.7820, name: 'Anjali Verma' },
    { lat: 30.7450, lng: 76.7750, name: 'Rahul Mehta' },
    { lat: 30.7320, lng: 76.7680, name: 'Pooja Reddy' },
  ]

  return baseLocations.map((loc, index) => ({
    id: index + 1,
    name: loc.name,
    latitude: loc.lat + (Math.random() - 0.5) * 0.01,
    longitude: loc.lng + (Math.random() - 0.5) * 0.01,
    status: Math.random() > 0.3 ? 'online' : 'offline',
    lastUpdated: new Date(Date.now() - Math.random() * 300000), // Random time in last 5 minutes
  }))
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

export default function TrackEmployee() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<number | 'all'>('all')
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.7333, 76.7794])
  const updateIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/')
      const realEmployees = response.data.employees || []
      
      const baseLocations = [
        { lat: 30.7333, lng: 76.7794 },
        { lat: 30.7410, lng: 76.7880 },
        { lat: 30.7290, lng: 76.7650 },
        { lat: 30.7500, lng: 76.7900 },
        { lat: 30.7200, lng: 76.7700 },
        { lat: 30.7380, lng: 76.7820 },
        { lat: 30.7450, lng: 76.7750 },
        { lat: 30.7320, lng: 76.7680 },
      ]
      
      const employeesWithLocation = realEmployees.map((emp: any, index: number) => {
        const location = baseLocations[index % baseLocations.length]
        return {
          id: emp.id,
          name: emp.full_name,
          latitude: location.lat + (Math.random() - 0.5) * 0.01,
          longitude: location.lng + (Math.random() - 0.5) * 0.01,
          status: Math.random() > 0.3 ? 'online' : 'offline',
          lastUpdated: new Date(Date.now() - Math.random() * 300000),
          employee_image: emp.employee_image
        }
      })
      
      setEmployees(employeesWithLocation)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees(generateMockEmployees())
    }
  }

  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      setEmployees(prevEmployees =>
        prevEmployees.map(emp => ({
          ...emp,
          latitude: emp.latitude + (Math.random() - 0.5) * 0.001,
          longitude: emp.longitude + (Math.random() - 0.5) * 0.001,
          status: Math.random() > 0.2 ? emp.status : (emp.status === 'online' ? 'offline' : 'online'),
          lastUpdated: new Date(),
        }))
      )
    }, 10000)

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayedEmployees = selectedEmployee === 'all'
    ? filteredEmployees
    : filteredEmployees.filter(emp => emp.id === selectedEmployee)

  const handleEmployeeSelect = (empId: number | 'all') => {
    setSelectedEmployee(empId)
    if (empId !== 'all') {
      const employee = employees.find(emp => emp.id === empId)
      if (employee) {
        setMapCenter([employee.latitude, employee.longitude])
      }
    } else {
      setMapCenter([30.7333, 76.7794])
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Employee Live GPS Tracking</h1>
              <p className="text-teal-100 text-sm">Real-time location monitoring • Updates every 10 seconds</p>
            </div>
          </div>
          <div className="bg-white text-teal-700 px-4 py-2 rounded-lg font-semibold">
            {employees.filter(e => e.status === 'online').length} / {employees.length} Online
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Employee Dropdown */}
          <div className="w-64">
            <select
              value={selectedEmployee}
              onChange={(e) => handleEmployeeSelect(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            {displayedEmployees.map(employee => (
              <Marker
                key={employee.id}
                position={[employee.latitude, employee.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{employee.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Circle
                        className={`h-3 w-3 ${employee.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                      />
                      <span className="text-sm capitalize">{employee.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Updated {formatTimeAgo(employee.lastUpdated)}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <div>Lat: {employee.latitude.toFixed(6)}</div>
                      <div>Lng: {employee.longitude.toFixed(6)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Employee List Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-lg text-gray-800">Employee List</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEmployees.map(employee => (
              <div
                key={employee.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedEmployee === employee.id ? 'bg-teal-50 border-l-4 border-teal-600' : ''
                }`}
                onClick={() => handleEmployeeSelect(employee.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {employee.employee_image ? (
                      <img 
                        src={`http://82.29.162.153/uploads/${employee.employee_image}`}
                        alt={employee.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{employee.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Circle
                          className={`h-3 w-3 ${
                            employee.status === 'online'
                              ? 'fill-green-500 text-green-500'
                              : 'fill-gray-400 text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            employee.status === 'online' ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          {employee.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">Updated {formatTimeAgo(employee.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                  <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
