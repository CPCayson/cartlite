// src/components/MapView.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { initializeMap } from '../utils/googleMapsUtils';

const API_KEY = 'AIzaSyCOkJd62Hu9iEVlJ_LIIrakwbkm19cg8CU'; // Set your API key here once
const MapView = ({ isLeftPanelOpen, isRightPanelOpen, setIsLeftPanelOpen, appMode }) => {
  const mapRef = useRef(null);
  const rotationSliderRef = useRef(null);
  const tiltSliderRef = useRef(null);
  const { isLoaded, error } = useGoogleMaps(API_KEY);

  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      setLoading(false);

      const mapOptions = {
        center: { lat: 30.3083, lng: -89.3306 },
        zoom: 19,
        tilt: 45, // Initial tilt for 3D effect
        heading: 0, // Initial heading for rotation
        mapId: "6ff586e93e18149f",
        mapTypeId: 'satellite', // Ensure 3D effect is supported
        streetViewControl: false,
        rotateControl: true, // Enable rotate controls
        tiltControl: true, // Ensure tilt controls are enabled
      };

      const map = initializeMap(mapRef.current, mapOptions);
      setMapInstance(map);

      // Event listeners for sliders to update map heading and tilt
      if (rotationSliderRef.current) {
        rotationSliderRef.current.addEventListener('input', function () {
          map.setHeading(Number(this.value));
        });
      }

      if (tiltSliderRef.current) {
        tiltSliderRef.current.addEventListener('input', function () {
          map.setTilt(Number(this.value));
        });
      }
    } else if (error) {
      setLoading(false);
      console.error("Error loading Google Maps:", error);
    }
  }, [isLoaded, error]);

  return (
    <div className={`relative w-full h-full ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <img src="/loading-image.png" alt="Loading" className="h-16" />
        </div>
      )}

      <div ref={mapRef} className={`w-full h-full ${loading ? 'hidden' : ''}`}></div>

      {!loading && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-50">
          <p className="text-red-500">Failed to load the map. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white dark:bg-gray-700 p-2 rounded shadow-md">
          <div className="flex flex-col items-center">
            <label htmlFor="rotationSlider" className="text-gray-600 dark:text-gray-300 mb-2">Rotation</label>
            <input type="range" id="rotationSlider" ref={rotationSliderRef} min="0" max="360" defaultValue="0" className="w-full mb-4" />
            <label htmlFor="tiltSlider" className="text-gray-600 dark:text-gray-300 mb-2">Tilt</label>
            <input type="range" id="tiltSlider" ref={tiltSliderRef} min="0" max="67.5" defaultValue="45" className="w-full" />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
      >
        {isLeftPanelOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

MapView.propTypes = {
  isLeftPanelOpen: PropTypes.bool.isRequired,
  isRightPanelOpen: PropTypes.bool.isRequired,
  setIsLeftPanelOpen: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
};

export default MapView;