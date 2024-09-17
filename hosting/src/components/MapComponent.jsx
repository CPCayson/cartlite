// src/components/MapComponent.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Spinner, Input, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { loadGoogleMapsScript } from '../api/googleMapsApi';

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
const mapOptions = {
  tilt: 66,
  heading: 80,
  restriction: {
    latLngBounds: baySaintLouisBounds,
    strictBounds: true,
  },
  mapId: "6ff586e93e18149f",
  streetViewControl: false,
};

/**
 * MapComponent displays a Google Map with business markers and handles destination selection via autocomplete.
 */
const MapComponent = ({
  businesses,
  selectedPlace,
  onSearchDestinationSelect,
  onSearchPickupSelect,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const mapRef = useRef(null);
  const destinationInputRef = useRef(null);
  const [destination, setDestination] = useState('');

  /**
   * Initialize autocomplete for destination input
   */
  const initAutocomplete = useCallback(
    (mapInstance) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('Google Maps API not loaded');
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        {
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(baySaintLouisBounds.south, baySaintLouisBounds.west),
            new window.google.maps.LatLng(baySaintLouisBounds.north, baySaintLouisBounds.east)
          ),
          strictBounds: true,
          types: ['geocode'],
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const formattedAddress = place.formatted_address;
          setDestination(formattedAddress);
          onSearchDestinationSelect(formattedAddress);

          // Optionally, pan the map to the selected place
          mapInstance.panTo(place.geometry.location);
          mapInstance.setZoom(15);
        }
      });
    },
    [onSearchDestinationSelect]
  );

  /**
   * Initialize map and autocomplete
   */
  const initMap = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 30.3083, lng: -89.3306 }, // Center of Bay Saint Louis
      zoom: 13,
      ...mapOptions,
    });

    setMap(mapInstance);
    initAutocomplete(mapInstance);
  }, [initAutocomplete]);

  /**
   * Add markers to the map
   */
  const addMarkersToMap = useCallback(
    (places) => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Add place markers
      places.forEach((place) => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map: map,
          title: place.name,
          icon: {
            url: '/assets/marker.png',
            scaledSize: new window.google.maps.Size(50, 50),
          },
        });
        markersRef.current.push(marker);
      });
    },
    [map]
  );

  /**
   * Navigates the map to the selected place and adds a special marker.
   * @param {object} place - The selected place with latitude, longitude, and name.
   */
  const navigateToPlace = useCallback(
    (place) => {
      if (!map || !place) return;

      const newCenter = { lat: place.latitude, lng: place.longitude };
      const newHeading = Math.random() * 360;
      const newTilt = 65;

      map.panTo(newCenter);
      map.setTilt(newTilt);
      map.setHeading(newHeading);

      // Add a marker for the selected place
      const marker = new window.google.maps.Marker({
        position: newCenter,
        map: map,
        title: place.name,
        icon: {
          url: '/assets/serve.png',
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });

      markersRef.current.push(marker);
    },
    [map]
  );

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
   * Add markers for businesses when map or businesses data changes
   */
  useEffect(() => {
    if (map && businesses.length > 0) {
      addMarkersToMap(businesses);
    }
  }, [map, businesses, addMarkersToMap]);

  /**
   * Handle navigation to selected place when selectedPlace prop changes
   */
  useEffect(() => {
    if (selectedPlace && map) {
      navigateToPlace(selectedPlace);
    }
  }, [selectedPlace, map, navigateToPlace]);

  /**
   * Handle destination submit button click
   */
  const handleDestinationSubmit = () => {
    if (destination) {
      onSearchDestinationSelect(destination);
    }
  };

  return (
    <Flex height="100vh" direction="column" position="relative">
      {isLoaded ? (
        <>
          <Box ref={mapRef} height="100%" width="100%" />
          <Flex
            position="absolute"
            top="10px"
            left="50%"
            transform="translateX(-50%)"
            zIndex="10"
          >
            <Input
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              width="300px"
              mr={2}
            />
            <Button onClick={handleDestinationSubmit}>Submit</Button>
          </Flex>
        </>
      ) : (
        <Flex alignItems="center" justifyContent="center" height="100%">
          <Spinner size="xl" />
        </Flex>
      )}
    </Flex>
  );
};

MapComponent.propTypes = {
  businesses: PropTypes.array.isRequired,
  selectedPlace: PropTypes.object,
  onSearchDestinationSelect: PropTypes.func.isRequired,
  onSearchPickupSelect: PropTypes.func.isRequired,
};

export default React.memo(MapComponent);
