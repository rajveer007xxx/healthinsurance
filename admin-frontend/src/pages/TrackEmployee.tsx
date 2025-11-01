import { useEffect, useState } from 'react';
import { employeeAPI } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Employee {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
}

interface Location {
  id: number;
  employee_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

export default function TrackEmployee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchLocationHistory();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
      if (response.data.length > 0) {
        setSelectedEmployee(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationHistory = async () => {
    try {
      setLocations([]);
    } catch (error) {
      console.error('Failed to fetch location history:', error);
    }
  };

  const selectedEmployeeData = employees.find((e) => e.id.toString() === selectedEmployee);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Track Employee</h1>
        <p className="text-gray-500 mt-2">Monitor field employee locations in real-time</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Select Employee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedEmployeeData && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedEmployeeData.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{selectedEmployeeData.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={selectedEmployeeData.status === 'active' ? 'default' : 'secondary'}
                      className={
                        selectedEmployeeData.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {selectedEmployeeData.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Location Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 font-medium">Map Integration Required</p>
                  <p className="text-sm text-gray-500 mt-2">
                    GPS tracking map will be displayed here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Integrate with Google Maps or Leaflet for live tracking
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Location History</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No location history available</p>
              <p className="text-sm text-gray-400 mt-2">
                Location data will appear here once the employee starts tracking
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(location.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {location.accuracy && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ±{location.accuracy}m
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
