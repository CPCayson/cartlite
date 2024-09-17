// src/context/MapsContext.jsx

import { createContext, useState, useRef, useCallback, useEffect } from 'react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';
import PropTypes from 'prop-types';

const MapsContext = createContext();

export const MapsProvider = ({ children, apiKey }) => {
  const map = useRef(null); // Map instance reference
  const mapRef = useRef(null); // DOM element reference
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false); // Track if map is initialized
  const [error, setError] = useState(null);

  // Load the Google Maps script
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

  // Initialize the map instance once the script is loaded and the ref is ready
  const initializeMapInstance = useCallback(() => {
    if (isLoaded && mapRef.current && !map.current) {
      const mapOptions = {
        center: { lat: 30.3083, lng: -89.3306 },
        zoom: 19,
        mapTypeId: 'satellite',
      };

      map.current = new window.google.maps.Map(mapRef.current, mapOptions);
      setIsMapInitialized(true); // Mark the map as initialized
    }
  }, [isLoaded]);

  // Add a marker utility
  const addMarker = useCallback((position, options = {}) => {
    if (map.current) {
      const marker = new window.google.maps.Marker({
        position,
        map: map.current,
        ...options,
      });
      return marker;
    }
    return null;
  }, []);

  return (
    <MapsContext.Provider value={{ mapRef, initializeMapInstance, isMapInitialized, addMarker, isLoaded }}>
      {children}
    </MapsContext.Provider>
  );
};

MapsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  apiKey: PropTypes.string.isRequired,
};

export { MapsContext };
