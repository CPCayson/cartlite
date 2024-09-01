// src/hooks/useMapsContext.jsx

import { useContext, useEffect } from 'react';
import { MapsContext } from '../context/MapsContext';

export const useMapsContext = () => {
  const { map, initializeMapInstance, mapRef, isLoaded, error } = useContext(MapsContext);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      initializeMapInstance();
    }
  }, [isLoaded, mapRef, initializeMapInstance]);

  return { map, mapRef, isLoaded, error };
};
