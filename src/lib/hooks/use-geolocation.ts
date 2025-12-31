'use client';
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

export function useGeolocation(): GeolocationState {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocation(l => ({ ...l, error: 'Geolocation is not supported by your browser.', loading: false }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
      }
      setLocation(l => ({ ...l, error: errorMessage, loading: false }));
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, []);

  return location;
}
