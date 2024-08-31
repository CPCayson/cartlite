// src/hooks/useGoogleMaps.js
import { useEffect, useState } from 'react';
import { loadGoogleMapsScript } from '../api/googleMapsApi'

export const useGoogleMaps = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, [apiKey]);

  return { isLoaded, error };
};
