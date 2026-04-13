import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this device');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error, loading };
};

export default useGeolocation;
