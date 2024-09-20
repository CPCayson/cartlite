// src/components/SearchBar.jsx

import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, Search } from 'lucide-react';
import {
  Input,
  Button,
  Box,
  Flex,
  Select,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
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
  autoPopulateDestination, // New prop for auto-populating destination
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
  const [preferredPickupTime, setPreferredPickupTime] = useState('ASAP');
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const isFormValid = pickupLocation && destination;
  const { bookingAmount, updateBookingAmount } = useBookingCalculation();

  // Handle auto-populating destination from external triggers
  useEffect(() => {
    if (autoPopulateDestination) {
      setDestination(autoPopulateDestination.address);
      setDestinationCoords(autoPopulateDestination.coords);
      onDestinationSelect(autoPopulateDestination.address, autoPopulateDestination.coords);
      setIsDestinationSelected(true);
    }
  }, [autoPopulateDestination, onDestinationSelect]);

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
            onPickupSelect(results[0].formatted_address, {
              latitude: latLng.lat,
              longitude: latLng.lng,
            });
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
            onDestinationSelect(place.formatted_address, coords);
            setIsDestinationSelected(true);
          } else {
            setPickupLocation(place.formatted_address);
            setPickupCoords(coords);
            onPickupSelect(place.formatted_address, coords);

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
      preferredPickupTime,
      numberOfPassengers,
    });
  };

  /**
   * Generates time options incrementing by 5 minutes up to 45 minutes.
   */
  const generateTimeOptions = () => {
    const options = [{ label: 'ASAP', value: 'ASAP' }];
    for (let i = 5; i <= 45; i += 5) {
      options.push({ label: `${i} minutes`, value: `${i} minutes` });
    }
    return options;
  };

  return (
    <Box
      p={4}
      bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
      rounded="lg"
      w="full"
      h="auto"
      position="sticky"
      top={0}
      zIndex={1000}
    >
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
              bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
              color="white"
              fontWeight="bold"
              fontFamily="Poppins, sans-serif"
            />
            <Button
              variant="ghost"
              onClick={() => destinationInputRef.current.focus()}
              aria-label="Search Destination"
            >
              <Search size={20} color="white" />
            </Button>
          </Flex>

          {/* Pickup Input (Visible after destination is selected) */}
          {isDestinationSelected && (
            <Flex align="center" w="full" mt={2}>
              <Input
                type="text"
                ref={pickupInputRef}
                placeholder="Pickup location..."
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full"
                isReadOnly={!isEditingPickup}
                bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
                color="white"
                fontWeight="bold"
                fontFamily="Poppins, sans-serif"
              />
              <Button onClick={() => setIsEditingPickup(!isEditingPickup)} ml={2}>
                {isEditingPickup ? 'Save' : 'Edit'}
              </Button>
            </Flex>
          )}

          {/* Preferred Pickup Time and Number of Passengers */}
          {isDestinationSelected && (
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} mt={2}>
              {/* Preferred Pickup Time */}
              <Select
                placeholder="Preferred Pickup Time"
                value={preferredPickupTime}
                onChange={(e) => setPreferredPickupTime(e.target.value)}
                bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
                color="white"
                fontWeight="bold"
                fontFamily="Poppins, sans-serif"
              >
                {generateTimeOptions().map((option) => (
                  <option key={option.value} value={option.value} style={{ color: 'black' }}>
                    {option.label}
                  </option>
                ))}
              </Select>

              {/* Number of Passengers */}
              <NumberInput
                min={1}
                max={10}
                value={numberOfPassengers}
                onChange={(valueString) => setNumberOfPassengers(parseInt(valueString))}
              >
                <NumberInputField
                  placeholder="Passengers"
                  bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
                  color="white"
                  fontWeight="bold"
                  fontFamily="Poppins, sans-serif"
                />
              </NumberInput>
            </Flex>
          )}

          {/* Book and Checkout Button */}
          {isDestinationSelected && (
            <Button
              type="submit"
              colorScheme="blue"
              mt={4}
              w="full"
              isLoading={isLoading}
              isDisabled={!isFormValid || isLoading}
              leftIcon={<RefreshCw size={20} />}
            >
              {isLoading
                ? 'Processing...'
                : `Book and Checkout (${bookingAmount ? `$${bookingAmount}` : '...'} )`}
            </Button>
          )}
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
  autoPopulateDestination: PropTypes.shape({
    address: PropTypes.string,
    coords: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  }), // New prop for auto-populating destination
};

export default SearchBar;
