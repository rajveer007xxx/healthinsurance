import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [tracking, setTracking] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    let watchId: number | null = null;

    if (tracking && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setLocationError('');
          
          sendLocationToBackend(newLocation, position.coords.accuracy);
        },
        (error) => {
          setLocationError(error.message);
          setTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [tracking]);

  const requestLocationPermission = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setTracking(true);
      },
      (error) => {
        setLocationError(error.message);
        setShowLocationModal(true);
      }
    );
  };

  const sendLocationToBackend = async (loc: { latitude: number; longitude: number }, accuracy?: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://82.29.162.153/api/tracking/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: accuracy,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to send location:', error);
    }
  };

  const handleEnableLocation = () => {
    setShowLocationModal(false);
    requestLocationPermission();
  };

  const permissions = user.permissions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-xs text-blue-100">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-blue-700 rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Location Status */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tracking && location ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">✓ Location tracking active</p>
                  <p className="text-xs text-green-700 mt-1">
                    Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                  </p>
                  {lastUpdate && (
                    <p className="text-xs text-green-600 mt-1">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-900">⚠ Location tracking inactive</p>
                {locationError && (
                  <p className="text-xs text-yellow-700 mt-1">{locationError}</p>
                )}
                <Button
                  onClick={requestLocationPermission}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Enable Location Tracking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon size={20} className="text-blue-600" />
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((permission: string, index: number) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-900"
                  >
                    {permission.replace(/_/g, ' ').toUpperCase()}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No permissions assigned yet. Contact your administrator.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {permissions.includes('subscriber') && (
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <User size={24} />
                <span className="text-xs">Subscribers</span>
              </Button>
            )}
            {permissions.includes('complaint') && (
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <SettingsIcon size={24} />
                <span className="text-xs">Complaints</span>
              </Button>
            )}
            {permissions.includes('transaction') && (
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <MapPin size={24} />
                <span className="text-xs">Transactions</span>
              </Button>
            )}
            {permissions.includes('get_paid_app') && (
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <MapPin size={24} />
                <span className="text-xs">Get Paid</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Permission Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('locationPermission')}</DialogTitle>
            <DialogDescription>
              {t('locationPermissionMessage')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button onClick={handleEnableLocation} className="w-full bg-blue-600 hover:bg-blue-700">
              {t('enableLocation')}
            </Button>
            <Button onClick={() => setShowLocationModal(false)} variant="outline" className="w-full">
              {t('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
