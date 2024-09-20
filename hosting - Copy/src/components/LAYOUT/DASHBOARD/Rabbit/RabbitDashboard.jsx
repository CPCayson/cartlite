// src/components/LAYOUT/DASHBOARD/Rabbit/RabbitDashboard.jsx

import React from 'react';
import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import {useRide} from '@context/RideContext'; // Custom hook to consume RideContext

const RabbitDashboard = () => {
  const {
    selectedRide,
    rideRequestId,
    rideRequest,
    handleCancelRide,
    handleSearchDestinationSelect,
    handleSearchPickupSelect,
    handleRideRequestCreation,
    isHandlingRide,
  } = useRide();

  /**
   * Handles the search for destination selection.
   * @param {string} destination - The selected destination.
   */
  const onSearchDestinationSelect = (destination) => {
    handleSearchDestinationSelect(destination);
    // Additional logic if needed
  };

  /**
   * Handles the search for pickup selection.
   * @param {string} pickup - The selected pickup location.
   */
  const onSearchPickupSelect = (pickup) => {
    handleSearchPickupSelect(pickup);
    // Additional logic if needed
  };

  /**
   * Handles the cancellation of the ride.
   */
  const onCancelRide = () => {
    handleCancelRide();
    // Additional logic if needed
  };

  if (!selectedRide) {
    return (
      <Box p={4} bg="gray.100" rounded="md">
        <Text fontSize="lg" fontWeight="bold">No Ride Selected</Text>
        {/* Implement ride selection logic */}
      </Box>
    );
  }

  return (
    <Box p={4} bg="gray.100" rounded="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Ride Details</Text>
        <Text><strong>Pickup:</strong> {rideRequest.user_location}</Text>
        <Text><strong>Destination:</strong> {rideRequest.destination_location}</Text>
        <Text><strong>Fare:</strong> ${rideRequest.rideFee.toFixed(2)}</Text>
        <HStack spacing={4}>
          <Button colorScheme="red" onClick={onCancelRide}>
            Cancel Ride
          </Button>
          {/* Add more buttons as needed */}
        </HStack>
      </VStack>
    </Box>
  );
};

// Remove PropTypes since props are no longer needed
RabbitDashboard.propTypes = {
  // No props needed as we're using Context
};

export default RabbitDashboard;
