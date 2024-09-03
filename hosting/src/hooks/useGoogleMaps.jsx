// src/hooks/useGoogleMaps.js
//The custom hook useGoogleMaps is essential because it provides a React-friendly way to manage the loading state of the Google Maps script. Hooks are a powerful feature in React that allows you to manage side effects and state logic in a more modular way.
import { useEffect, useState } from 'react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';

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
