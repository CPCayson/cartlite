// src/components/MapComponent.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Spinner } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { loadGoogleMapsScript } from '@api/googleMapsApi';

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
  businesses,
  pickupLocation,
  destinationLocation,
  onSearchDestinationSelect,
  onSearchPickupSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const mapRef = useRef(null);

  /**
   * Initialize map
   */
  const initMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 30.3083, lng: -89.3306 }, // Center of Bay Saint Louis
      zoom: 13,
      ...defaultMapOptions,
    });

    setMap(mapInstance);
  }, []);

  /**
   * Add markers to the map
   */
  const addMarkersToMap = useCallback(
    (places) => {
      if (!map) return;

      // Clear existing business markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

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
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
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

  return (
    <Flex height="100%" direction="column" position="relative">
      {isLoaded ? (
        <Box ref={mapRef} height="100%" width="100%" />
      ) : (
        <Flex alignItems="center" justifyContent="center" height="100%">
          <Spinner size="xl" />
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

export default React.memo(MapComponent);
