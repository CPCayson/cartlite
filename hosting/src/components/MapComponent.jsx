import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Spinner, Input, Button } from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import PropTypes from 'prop-types';
import { loadGoogleMapsScript } from '../api/googleMapsApi';

const baySaintLouisBounds = {
  north: 30.3617,
  south: 30.2817,
  east: -89.2978,
  west: -89.4178,
};

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

const MapComponent = ({
  businesses,
  selectedPlace,
  searchDestination,
  searchPickupLocation,
  onSearchDestinationSelect,
  onSearchPickupSelect
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const mapRef = useRef(null);
  const destinationInputRef = useRef(null);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      initMap();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (selectedPlace) {
      navigateToPlace(selectedPlace);
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (map && businesses.length > 0) {
      addMarkersToMap(businesses);
    }
  }, [map, businesses]);

  const initAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(30.2817, -89.4178),
      new window.google.maps.LatLng(30.3617, -89.2978)
    );

    const options = {
      bounds: bounds,
      strictBounds: true,
      types: ['geocode'],
    };

    const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current, options);
    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        const formattedAddress = place.formatted_address;
        setDestination(formattedAddress);
        onSearchDestinationSelect(formattedAddress);
      }
    });
  };

  const addMarkersToMap = (places) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add place markers
    places.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
        icon: {
          url: "/assets/place_marker.png",
          scaledSize: new window.google.maps.Size(50, 50),
        }
      });
      markersRef.current.push(marker);
    });
  };

  const navigateToPlace = (place) => {
    if (!map || !place) return;

    const newCenter = { lat: place.latitude, lng: place.longitude };
    const newHeading = Math.random() * 360;
    const newTilt = 65;

    map.panTo(newCenter);
    map.setTilt(newTilt);
    map.setHeading(newHeading);

    // Ensure the marker is updated for the selected place
    const marker = new window.google.maps.Marker({
      position: newCenter,
      map: map,
      title: place.name,
      icon: {
        url: "/assets/selected_place_marker.png",
        scaledSize: new window.google.maps.Size(60, 60),
      }
    });

    markersRef.current.push(marker);
  };

  const initMap = () => {
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 30.3083, lng: -89.3306 },
      zoom: 19,
      ...mapOptions
    });

    setMap(mapInstance);
    initAutocomplete();
  };

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
          <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex="10">
            <Input
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              width="300px"
            />
            <Button onClick={handleDestinationSubmit} ml={2}>Submit</Button>
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
  searchDestination: PropTypes.string,
  searchPickupLocation: PropTypes.string,
  onSearchDestinationSelect: PropTypes.func.isRequired,
  onSearchPickupSelect: PropTypes.func.isRequired,
};

export default React.memo(MapComponent);