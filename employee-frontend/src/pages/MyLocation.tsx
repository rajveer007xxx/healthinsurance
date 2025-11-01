import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Clock, CheckCircle } from 'lucide-react';
import { employeeAPI } from '../utils/api';

export default function MyLocation() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    fetchLocationHistory();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
        },
        (_error) => {
          setError('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const fetchLocationHistory = async () => {
    try {
      const response = await employeeAPI.getLocationHistory();
      setLocationHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch location history:', error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!currentLocation) {
      setError('Please allow location access first.');
      return;
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await employeeAPI.updateLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });

      setSuccess(true);
      fetchLocationHistory();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Location</h1>
        <p className="text-gray-500 mt-1">Share your current GPS location with the admin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Location updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {gettingLocation ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Navigation className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-2" />
                  <div className="text-gray-600">Getting your location...</div>
                </div>
              </div>
            ) : currentLocation ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">GPS Coordinates</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-600">Latitude:</span>
                      <span className="font-mono text-purple-900">{currentLocation.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">Longitude:</span>
                      <span className="font-mono text-purple-900">{currentLocation.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-sm text-blue-600 mb-2">Google Maps Link</div>
                  <a
                    href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800 underline text-sm font-medium"
                  >
                    View on Google Maps →
                  </a>
                </div>

                <Button
                  onClick={handleUpdateLocation}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={loading}
                >
                  {loading ? 'Updating Location...' : 'Update Location'}
                </Button>

                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="w-full"
                  disabled={gettingLocation}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Refresh Location
                </Button>
              </div>
            ) : (
              <div className="text-center p-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-600 mb-4">Location not available</div>
                <Button onClick={getCurrentLocation} variant="outline">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {locationHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <div>No location history yet</div>
                </div>
              ) : (
                locationHistory.map((location, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(location.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">About Location Tracking</h3>
              <p className="text-sm text-gray-600">
                Your location is shared with the admin to help track field activities and improve service delivery.
                Location data is only recorded when you manually update it using the button above.
                You can view your location history and see where you've been throughout the day.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
