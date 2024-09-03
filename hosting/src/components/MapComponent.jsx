import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, Spinner, Input, Button } from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useLoadScript } from '@react-google-maps/api';
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

const MapComponent = ({ center = { lat: 30.3083, lng: -89.3306 }, zoom = 19, onDestinationSubmit, selectedPlace }) => {
  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });
  const [map, setMap] = useState(null);
  const markersRef = useRef([]); // Ref to keep track of all markers
  const mapRef = useRef(null);
  const destinationInputRef = useRef(null);
  const [destination, setDestination] = useState('');

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
      }
    });
  };

  const handleDestinationSubmit = () => {
    if (destination) {
      onDestinationSubmit(destination);
    }
  };

  const loadMapData = useCallback(async () => {
    if (!isLoaded || !map) return;

    try {
      const [cartsSnapshot, placesSnapshot] = await Promise.all([
        getDocs(collection(db, 'carts')),
        getDocs(collection(db, 'places')),
      ]);

      const cartsData = cartsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const placesData = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      addMarkersToMap(cartsData, placesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [isLoaded, map]);

  const addMarkersToMap = (cartsData, placesData) => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add cart markers
    cartsData.forEach(cart => {
      const marker = new window.google.maps.Marker({
        position: { lat: cart.latitude, lng: cart.longitude },
        map: map,
        title: cart.name,
        icon: {
          url: "URL_TO_CART_MARKER_ICON", // Specify the URL for your cart marker icon
          scaledSize: new window.google.maps.Size(50, 50), // Adjust size as needed
        }
      });
      markersRef.current.push(marker);
    });

    // Add place markers
    placesData.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
        icon: {
          url: "URL_TO_PLACE_MARKER_ICON", // Specify the URL for your place marker icon
          scaledSize: new window.google.maps.Size(50, 50), // Adjust size as needed
        }
      });
      markersRef.current.push(marker);
    });
  };

  const navigateToPlace = (place) => {
    if (!map || !place) return;

    const newCenter = { lat: place.latitude, lng: place.longitude };
    const newHeading = Math.random() * 360; // Random heading for demonstration
    const newTilt = 65; // Fixed tilt for demonstration

    map.panTo(newCenter); // Pan to new location
    map.setTilt(newTilt); // Set new tilt
    map.setHeading(newHeading); // Set new heading

    // Ensure the marker is updated for the selected place
    const marker = new window.google.maps.Marker({
      position: newCenter,
      map: map,
      title: place.name,
      icon: {
        url: "URL_TO_SELECTED_PLACE_MARKER_ICON", // Specify the URL for your selected place marker icon
        scaledSize: new window.google.maps.Size(60, 60), // Adjust size as needed
      }
    });

    markersRef.current.push(marker);
  };

  const initMap = async () => {
    const { Map } = await window.google.maps.importLibrary("maps");

    const mapInstance = new Map(mapRef.current, {
      center: { lat: 30.3083, lng: -89.3306 },
      zoom: 19,
      tilt: 60,
      heading: 100,
      mapId: "6ff586e93e18149f",
      streetViewControl: false,
    });

    setMap(mapInstance);

    initAutocomplete();
    await loadMapData();
  };

  return (
    <Flex height="100vh" direction="column" position="relative">
      {isLoaded ? (
        <>
          <Box ref={mapRef} height="100%" width="100%" />
          {/* Destination Input in Center */}
          <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex="10">
            <Input
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              width="300px"
            />
            <Button onClick={handleDestinationSubmit} ml={2}>
              <Search size={20} />
            </Button>
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
  center: PropTypes.object,
  zoom: PropTypes.number,
  onDestinationSubmit: PropTypes.func.isRequired,
  selectedPlace: PropTypes.object, // To handle the selected place from the left panel
};

export default React.memo(MapComponent);
