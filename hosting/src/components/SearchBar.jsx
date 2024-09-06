import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Clock, Search } from 'lucide-react';
import { Input, Button, Select, Box, Flex } from '@chakra-ui/react';
import { loadGoogleMapsScript } from '../api/googleMapsApi';

const SearchBar = ({
  paymentIntentId,
  paymentIntentStatus,
  onPaymentIntentUpdate,
  onBookRide,
  onCreateCheckoutSession,
  onDestinationSelect,
  onPickupSelect
}) => {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [countdownTime, setCountdownTime] = useState('Now');
  const [bookingAmount, setBookingAmount] = useState(0);
  const destinationInputRef = useRef(null);
  const pickupInputRef = useRef(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps API
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
    if (isLoaded) {
      const cleanup = initAutocomplete();
      return cleanup;
    }
  }, [isLoaded]);

  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      updateBookingAmount();
    }
  }, [pickupCoords, destinationCoords]);

  // Initialize Google Maps autocomplete
  const initAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return () => {};
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
    const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, options);

    const destinationListener = destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        setDestination(place.formatted_address);
        setDestinationCoords(place.geometry.location);
        onDestinationSelect(place.formatted_address);
        setStep(1);
      }
    });

    const pickupListener = pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        setPickupLocation(place.formatted_address);
        setPickupCoords(place.geometry.location);
        onPickupSelect(place.formatted_address);
        setStep(2);
      }
    });

    return () => {
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(destinationListener);
        window.google.maps.event.removeListener(pickupListener);
      }
    };
  };

  // Geolocation for current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationString = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
          setPickupLocation(locationString);
          setPickupCoords(new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude));
          onPickupSelect(locationString);
          setStep(2);
        },
        (error) => {
          console.error('Error fetching current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Booking amount calculation
  const updateBookingAmount = () => {
    if (pickupCoords && destinationCoords) {
      const distance = calculateDistance(
        pickupCoords.lat(), pickupCoords.lng(),
        destinationCoords.lat(), destinationCoords.lng()
      );

      const normalizedDistance = normalizeDistance(distance);
      const price = calculatePrice(normalizedDistance);
      setBookingAmount(price.toFixed(2));
    } else {
      setBookingAmount(0);
    }
  };

  return (
    <Box className="search-bar-container" p={4} bg="gray.100" rounded="lg" w="full" h="auto">
      <Flex direction="column" gap={4} w="full">
        {step >= 0 && (
          <Flex align="center" w="full">
            <Input
              type="text"
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full"
            />
            <Search size={20} />
          </Flex>
        )}

        {step >= 1 && (
          <Flex align="center" w="full" mt={2}>
            <Input
              type="text"
              ref={pickupInputRef}
              placeholder="Pickup location..."
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              disabled={pickupLocation === 'Current Location'}
              className="w-full"
            />
            <Button onClick={handleUseCurrentLocation}>Use Current Location</Button>
          </Flex>
        )}

        {step >= 2 && (
          <>
            <Flex align="center" w="full" mt={2}>
              <Select value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)} className="w-full">
                <option value="Now">Now</option>
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </Select>
            </Flex>

            <Flex align="center" w="full" mt={2}>
              <Button colorScheme="teal" onClick={handleBookingConfirmation} w="full">
                Book Now (${bookingAmount})
              </Button>
            </Flex>
            <Flex align="center" w="full" mt={2}>
              <Button colorScheme="blue" onClick={handleCreateCheckoutSession} w="full">
                Checkout (${bookingAmount})
              </Button>
            </Flex>
          </>
        )}
      </Flex>
    </Box>
  );
};

SearchBar.propTypes = {
  paymentIntentId: PropTypes.string,
  paymentIntentStatus: PropTypes.string,
  onPaymentIntentUpdate: PropTypes.func.isRequired,
  onBookRide: PropTypes.func.isRequired,
  onCreateCheckoutSession: PropTypes.func.isRequired,
  onDestinationSelect: PropTypes.func.isRequired,
  onPickupSelect: PropTypes.func.isRequired,
};

export default SearchBar;
