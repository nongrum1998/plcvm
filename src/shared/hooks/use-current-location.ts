import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export type LocationName = {
  city: string | null;
  district: string | null;
  region: string | null;
  country: string | null;
  formatted: string;
};

export function useCurrentLocation() {
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [locationName, setLocationName] = useState<LocationName | null>(null);

  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    const result = await Location.requestForegroundPermissionsAsync();

    setPermission(result.status);

    return result.status === Location.PermissionStatus.GRANTED;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setLocation(position);

    return position;
  }, []);

  const getLocationName = useCallback(
    async (coordinates?: { latitude: number; longitude: number }) => {
      const coords = coordinates ?? location?.coords;

      if (!coords) {
        return null;
      }

      const [address] = await Location.reverseGeocodeAsync(coords);

      if (!address) {
        return null;
      }

      const city = address.city ?? null;
      const district = address.district ?? null;
      const region = address.region ?? null;
      const country = address.country ?? null;

      const formatted = [city, district, region, country].filter(Boolean).join(', ');

      const result = {
        city,
        district,
        region,
        country,
        formatted,
      };

      setLocationName(result);

      return result;
    },
    [location]
  );

  const getLocation = useCallback(async () => {
    setLoading(true);

    try {
      const granted = await requestPermission();

      if (!granted) {
        return null;
      }

      const position = await getCurrentLocation();

      return await getLocationName(position.coords);
    } finally {
      setLoading(false);
    }
  }, [requestPermission, getCurrentLocation, getLocationName]);

  return {
    permission,
    location,
    locationName,
    loading,

    requestPermission,
    getCurrentLocation,
    getLocationName,
    getLocation,
  };
}
