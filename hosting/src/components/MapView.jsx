import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Ensure these are correctly imported
import { loadGoogleMapsScript } from '../api/googleMapsApi'; // Ensure script is loaded

const MapView = ({ isLeftPanelOpen, isRightPanelOpen, setIsLeftPanelOpen }) => {
  const streetViewRef = useRef(null);
  const panoramaRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false); // Local state to check if API is loaded
  const [error, setError] = useState(null); // State to handle errors
  const [tilt, setTilt] = useState(0); // Initial tilt
  const [heading, setHeading] = useState(0); // Initial heading

  useEffect(() => {
    // Load Google Maps script
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsLoaded(true); // Set loaded state
      })
      .catch((err) => {
        console.error('Error loading Google Maps script:', err);
        setError(err);
      });
  }, []);

  useEffect(() => {
    if (isLoaded && streetViewRef.current) {
      // Initialize Street View
      panoramaRef.current = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: { lat: 30.3083, lng: -89.3306 }, // Example coordinates
        pov: { heading: 0, pitch: 0 }, // Initial point of view
        zoom: 1,
      });

      // Update the map view dynamically when tilt or heading changes
      panoramaRef.current.addListener('pov_changed', () => {
        const pov = panoramaRef.current.getPov();
        setTilt(pov.pitch);
        setHeading(pov.heading);
      });
    }
  }, [isLoaded]);

  // Function to update tilt and heading dynamically
  const updatePanoramaView = (newTilt, newHeading) => {
    if (panoramaRef.current) {
      panoramaRef.current.setPov({
        heading: newHeading,
        pitch: newTilt,
      });
    }
  };

  // Update map tilt and heading based on slider values
  useEffect(() => {
    updatePanoramaView(tilt, heading);
  }, [tilt, heading]);

  return (
    <div className={`relative w-full h-full ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-50">
          <p className="text-red-500">Failed to load the map. Please try again later.</p>
        </div>
      )}

      {/* Street View container */}
      <div ref={streetViewRef} className="w-full h-full"></div>

      {/* Tilt and Heading Sliders */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white dark:bg-gray-700 p-2 rounded shadow-md">
        <div className="flex flex-col items-center">
          <label htmlFor="tiltSlider" className="text-gray-600 dark:text-gray-300 mb-2">Tilt</label>
          <input
            type="range"
            id="tiltSlider"
            min="-90"
            max="90"
            value={tilt}
            onChange={(e) => setTilt(parseFloat(e.target.value))}
            className="w-full mb-4"
          />
          <label htmlFor="headingSlider" className="text-gray-600 dark:text-gray-300 mb-2">Heading</label>
          <input
            type="range"
            id="headingSlider"
            min="0"
            max="360"
            value={heading}
            onChange={(e) => setHeading(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Toggle button for the left panel */}
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
};

export default MapView;
