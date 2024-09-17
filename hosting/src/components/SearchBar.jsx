// src/components/SearchBar.jsx

import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, Search } from 'lucide-react';
import { Input, Button, Box, Flex } from '@chakra-ui/react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';
import { useBookingCalculation } from '../hooks/useBookingCalculation';
import { GeolocationContext } from '../context/GeolocationContext';
import { useAuth } from '../context/AuthContext';

/**
 * SearchBar component allows users to select destination and pickup locations and book rides.
 */
const SearchBar = ({
  onDestinationSelect,
  onPickupSelect,
  onBookRide,
  initialLatLng,
  selectedItem,
  selectedRide,
}) => {
  const { user } = useAuth();
  const { geolocation, updateGeolocation } = useContext(GeolocationContext);
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(initialLatLng || geolocation);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);
  const destinationInputRef = useRef(null);
  const pickupInputRef = useRef(null);
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFormValid = pickupLocation && destination;
  const { bookingAmount, updateBookingAmount } = useBookingCalculation();

  // Geocoding logic for reverse geocoding
  const reverseGeocode = useCallback(
    (latLng) => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded');
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            setPickupLocation(results[0].formatted_address);
            onPickupSelect(results[0].formatted_address);
          } else {
            console.error('No results found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
        }
      });
    },
    [onPickupSelect]
  );

  // Initialize the Google Maps autocomplete functionality
  const initAutocomplete = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    const options = {
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(30.2817, -89.4178),
        new window.google.maps.LatLng(30.3617, -89.2978)
      ),
      strictBounds: true,
      types: ['geocode'],
    };

    ['destination', 'pickup'].forEach((fieldType) => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        fieldType === 'destination' ? destinationInputRef.current : pickupInputRef.current,
        options
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          if (fieldType === 'destination') {
            setDestination(place.formatted_address);
            setDestinationCoords(coords);
            onDestinationSelect(place.formatted_address);
            setIsDestinationSelected(true);
          } else {
            setPickupLocation(place.formatted_address);
            setPickupCoords(coords);
            onPickupSelect(place.formatted_address);

            if (isEditingPickup && isLoaded) {
              updateGeolocation(coords);
              setIsEditingPickup(false);
            }
          }
        }
      });
    });
  }, [isEditingPickup, isLoaded, onDestinationSelect, onPickupSelect, updateGeolocation]);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }, []);

  // Initialize autocomplete and reverse geocode if needed
  useEffect(() => {
    if (isLoaded) {
      initAutocomplete();
      if (pickupCoords) {
        reverseGeocode(pickupCoords);
      }
    }
  }, [isLoaded, pickupCoords, initAutocomplete, reverseGeocode]);

  // Update pickup coordinates based on geolocation
  useEffect(() => {
    if (geolocation && isLoaded) {
      setPickupCoords(geolocation);
      reverseGeocode(geolocation);
    }
  }, [geolocation, isLoaded, reverseGeocode]);

  // Update booking amount based on pickup and destination coordinates
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      updateBookingAmount(pickupCoords, destinationCoords);
    }
  }, [pickupCoords, destinationCoords, updateBookingAmount]);

  /**
   * Handles updating the user's current location.
   */
  const handleUpdateLocation = () => {
    setIsLoading(true); // Start loader
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateGeolocation(newLatLng);
          setPickupCoords(newLatLng);
          reverseGeocode(newLatLng);
          setIsLoading(false); // Stop loader
        },
        (error) => {
          console.error('Error fetching current location:', error);
          setIsLoading(false); // Stop loader
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLoading(false); // Stop loader
    }
  };

  /**
   * Handles the booking of a ride.
   */
  const handleBookNow = () => {
    if (!destination || !pickupLocation) {
      alert('Please select both a destination and a pickup location before proceeding.');
      return;
    }

    onBookRide({
      destination,
      pickupLocation,
      bookingAmount,
    });
  };

  return (
    <Box p={4} bg="gray.100" rounded="lg" w="full" h="auto">
      <Flex direction="column" gap={4} w="full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleBookNow();
          }}
        >
          {/* Destination Input */}
          <Flex align="center" w="full">
            <Input
              type="text"
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full"
            />
            <Button variant="ghost" onClick={() => destinationInputRef.current.focus()}>
              <Search size={20} />
            </Button>
          </Flex>

          {/* Pickup Input (Visible after destination is selected) */}
          {isDestinationSelected && (
            <Flex align="center" w="full" mt={2}>
              <Button
                leftIcon={<RefreshCw size={16} />}
                onClick={handleUpdateLocation}
                mr={2}
                isLoading={isLoading}
              >
                Update Location
              </Button>
              <Input
                type="text"
                ref={pickupInputRef}
                placeholder="Pickup location..."
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full"
                isReadOnly={!isEditingPickup}
              />
              <Button onClick={() => setIsEditingPickup(!isEditingPickup)} ml={2}>
                {isEditingPickup ? 'Save' : 'Edit'}
              </Button>
            </Flex>
          )}

          {/* Book and Checkout Button */}
          <Button
            type="submit"
            colorScheme="blue"
            mt={4}
            w="full"
            isLoading={isLoading}
            isDisabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Processing...' : 'Book and Checkout'}
          </Button>
        </form>
      </Flex>
    </Box>
  );
};

SearchBar.propTypes = {
  onDestinationSelect: PropTypes.func.isRequired,
  onPickupSelect: PropTypes.func.isRequired,
  onBookRide: PropTypes.func.isRequired,
  initialLatLng: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  selectedItem: PropTypes.object,
  selectedRide: PropTypes.object,
};

export default SearchBar;
