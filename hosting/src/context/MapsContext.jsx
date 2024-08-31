// src/context/MapsContext.jsx

import { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';
import PropTypes from 'prop-types';

// Create a context for the map
const MapsContext = createContext();

export const MapsProvider = ({ children, apiKey }) => {
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, [apiKey]);

  const initializeMapInstance = useCallback(() => {
    if (isLoaded && mapRef.current && !map) {
      const mapOptions = {
        center: { lat: 30.3083, lng: -89.3306 },
        zoom: 19,
        mapTypeId: 'satellite',
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);
    }
  }, [isLoaded, map]);

  return (
    <MapsContext.Provider value={{ map, initializeMapInstance, mapRef, isLoaded, error }}>
      {children}
    </MapsContext.Provider>
  );
};

MapsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export { MapsContext };
