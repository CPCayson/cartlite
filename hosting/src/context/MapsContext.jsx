import { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';
import PropTypes from 'prop-types';

const MapsContext = createContext();

export const MapsProvider = ({ children, apiKey }) => {
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadScript = async () => {
      try {
        await loadGoogleMapsScript(apiKey);
        setIsLoaded(true);
      } catch (err) {
        setError(err);
        console.error('Error loading Google Maps script:', err);
      }
    };

    loadScript();
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

