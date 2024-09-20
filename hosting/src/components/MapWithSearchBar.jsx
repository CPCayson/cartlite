// src/components/LAYOUT/Dashboard/Rabbit/MapWithSearchBar.jsx

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import SearchBar from './shared/SearchBar';
import MapComponent from './MapComponent';
import { Box, Flex } from '@chakra-ui/react';

/**
 * MapWithSearchBar integrates the SearchBar with the MapComponent.
 * It manages the state for pickup and destination locations.
 */
const MapWithSearchBar = ({ businesses }) => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);

  /**
   * Handler when a destination is selected.
   * @param {string} address - The selected destination address.
   * @param {object} coords - The latitude and longitude of the destination.
   */
  const handleDestinationSelect = useCallback((address, coords) => {
    setDestinationLocation({
      address,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  }, []);

  /**
   * Handler when a pickup location is selected.
   * @param {string} address - The selected pickup address.
   * @param {object} coords - The latitude and longitude of the pickup location.
   */
  const handlePickupSelect = useCallback((address, coords) => {
    setPickupLocation({
      address,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  }, []);

  /**
   * Handler for booking a ride.
   * @param {object} rideDetails - Details of the ride to be booked.
   */
  const handleBookRide = (rideDetails) => {
    console.log('Booking Details:', rideDetails);
    // Implement your booking logic here, e.g., sending data to backend
  };

  return (
    <Flex direction="column" height="100%">
      {/* SearchBar at the top */}
      <SearchBar
        onDestinationSelect={handleDestinationSelect}
        onPickupSelect={handlePickupSelect}
        onBookRide={handleBookRide}
        // Optionally pass autoPopulateDestination if needed
      />

      {/* Map Component */}
      <Box flex="1" mt={4}>
        <MapComponent
          businesses={businesses}
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          onSearchDestinationSelect={handleDestinationSelect}
          onSearchPickupSelect={handlePickupSelect}
        />
      </Box>
    </Flex>
  );
};

MapWithSearchBar.propTypes = {
  businesses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      // Add other properties as needed
    })
  ).isRequired,
};

export default MapWithSearchBar;
