// src/components/shared/MapComponent.jsx

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { loadGoogleMapsScript } from '@api/googleMapsApi';
import { BusinessContext } from '@context/BusinessContext'; // Adjust path as needed

/**
 * Define the geographical bounds for Bay Saint Louis.
 */
const baySaintLouisBounds = {
  north: 30.3617,
  south: 30.2817,
  east: -89.2978,
  west: -89.4178,
};

/**
 * Define map options including tilt, heading, and restrictions.
 */
const defaultMapOptions = {
  tilt: 0, // Default tilt
  heading: 0, // Default heading
  restriction: {
    latLngBounds: baySaintLouisBounds,
    strictBounds: true,
  },
  mapId: '6ff586e93e18149f', // Ensure this is your actual Map ID
  streetViewControl: false,
};

/**
 * MapComponent displays a Google Map with business markers and handles destination selection via external inputs.
 */
const MapComponent = ({
  pickupLocation,
  destinationLocation,
  onSearchDestinationSelect,
  onSearchPickupSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const mapRef = useRef(null);

  const { businesses, selectedItem } = useContext(BusinessContext); // Access businesses and selected business from context

  /**
   * Initialize map
   */
  const initMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    const validPickup = pickupLocation && typeof pickupLocation.latitude === 'number' && typeof pickupLocation.longitude === 'number';
    const validDestination = destinationLocation && typeof destinationLocation.latitude === 'number' && typeof destinationLocation.longitude === 'number';

    const center = validPickup
      ? { lat: pickupLocation.latitude, lng: pickupLocation.longitude }
      : { lat: 30.3083, lng: -89.3306 }; // Fallback center

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 13,
      ...defaultMapOptions,
    });

    setMap(mapInstance);
  }, [pickupLocation, destinationLocation]);

  /**
   * Add markers to the map
   */
  const addMarkersToMap = useCallback(
    (places) => {
      if (!map) return;

      // Clear existing business markers
      markersRef.current.forEach((marker) => {
        if (marker.title !== 'Pickup Location' && marker.title !== 'Destination' && marker.title !== 'Selected Business') {
          marker.setMap(null);
        }
      });
      markersRef.current = markersRef.current.filter(
        (marker) => marker.title === 'Pickup Location' || marker.title === 'Destination' || marker.title === 'Selected Business'
      );

      // Add place markers
      places.forEach((place) => {
        if (
          typeof place.latitude === 'number' &&
          typeof place.longitude === 'number'
        ) {
          const marker = new window.google.maps.Marker({
            position: { lat: place.latitude, lng: place.longitude },
            map: map,
            title: place.name,
            icon: {
              url: '/assets/marker.png', // Ensure this path is correct
              scaledSize: new window.google.maps.Size(50, 50),
            },
          });

          // Optional: Add click listener to marker
          marker.addListener('click', () => {
            // Handle marker clicks if needed
            console.log(`Marker for ${place.name} clicked`);
          });

          markersRef.current.push(marker);
        } else {
          console.warn('Invalid place coordinates:', place);
        }
      });
    },
    [map]
  );

  /**
   * Add pickup and destination markers
   */
  const addSpecialMarkers = useCallback(() => {
    if (!map) return;

    // Remove existing special markers
    markersRef.current = markersRef.current.filter((marker) => {
      const title = marker.getTitle();
      if (title === 'Pickup Location' || title === 'Destination' || title === 'Selected Business') {
        marker.setMap(null);
        return false;
      }
      return true;
    });

    // Add Pickup Marker
    if (
      pickupLocation &&
      typeof pickupLocation.latitude === 'number' &&
      typeof pickupLocation.longitude === 'number'
    ) {
      const pickupMarker = new window.google.maps.Marker({
        position: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
        map: map,
        title: 'Pickup Location',
        icon: {
          url: '/assets/pickup.png', // Ensure you have this icon in public/assets
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });
      markersRef.current.push(pickupMarker);

      // Adjust Map View
      map.panTo(pickupMarker.getPosition());
      map.setZoom(15);
      map.setTilt(45); // Tilting the map to 45 degrees for 3D view
      map.setHeading(90); // Heading east
    }

    // Add Destination Marker
    if (
      destinationLocation &&
      typeof destinationLocation.latitude === 'number' &&
      typeof destinationLocation.longitude === 'number'
    ) {
      const destinationMarker = new window.google.maps.Marker({
        position: { lat: destinationLocation.latitude, lng: destinationLocation.longitude },
        map: map,
        title: 'Destination',
        icon: {
          url: '/assets/destination.png', // Ensure you have this icon in public/assets
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });
      markersRef.current.push(destinationMarker);

      // Adjust Map View
      map.panTo(destinationMarker.getPosition());
      map.setZoom(15);
      map.setTilt(45); // Tilting the map to 45 degrees for 3D view
      map.setHeading(90); // Heading east
    }
  }, [map, pickupLocation, destinationLocation]);

  /**
   * Load Google Maps script on component mount
   */
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is missing in environment variables.');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }, []);

  /**
   * Initialize map after script is loaded
   */
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      initMap();
    }
  }, [isLoaded, initMap]);

  /**
   * Add business markers when map or businesses data changes
   */
  useEffect(() => {
    if (map && businesses.length > 0) {
      addMarkersToMap(businesses);
    }
  }, [map, businesses, addMarkersToMap]);

  /**
   * Add pickup and destination markers when locations change
   */
  useEffect(() => {
    if (map) {
      addSpecialMarkers();
    }
  }, [map, pickupLocation, destinationLocation, addSpecialMarkers]);

  /**
   * Handle selected business to focus on map
   */
  useEffect(() => {
    if (selectedItem && map) {
      const { latitude, longitude, name, category } = selectedItem;

      // Validate coordinates
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.error('Selected item has invalid coordinates:', selectedItem);
        return;
      }

      const position = { lat: latitude, lng: longitude };
      map.panTo(position);
      map.setZoom(16);

      // Optionally, add an info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><h3>${name}</h3><p>${category}</p></div>`,
      });

      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: name,
        icon: {
          url: '/assets/marker-selected.png', // Use a different icon for selected marker
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      infoWindow.open(map, marker);

      // Add the selected marker to markersRef for cleanup
      markersRef.current.push(marker);

      // Clean up the marker and info window when selectedItem changes
      return () => {
        marker.setMap(null);
        infoWindow.close();
      };
    }
  }, [selectedItem, map]);

  return (
    <Flex height="100%" direction="column" position="relative">
      {isLoaded && map ? (
        <Box ref={mapRef} height="100%" width="100%" />
      ) : (
        <Flex alignItems="center" justifyContent="center" height="100%">
          <Spinner size="xl" color="purple.500" /> {/* Spinner Component */}
        </Flex>
      )}
    </Flex>
  );
};

MapComponent.propTypes = {
  businesses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      // Add other properties as needed
    })
  ).isRequired,
  pickupLocation: PropTypes.shape({
    address: PropTypes.string,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  destinationLocation: PropTypes.shape({
    address: PropTypes.string,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  onSearchDestinationSelect: PropTypes.func.isRequired,
  onSearchPickupSelect: PropTypes.func.isRequired,
};

MapComponent.defaultProps = {
  pickupLocation: null,
  destinationLocation: null,
};

export default React.memo(MapComponent);
