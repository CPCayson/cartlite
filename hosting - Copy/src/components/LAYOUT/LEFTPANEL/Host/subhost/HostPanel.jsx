// src/components/leftpanel/subhost/HostPanel.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Text, Button } from '@chakra-ui/react';
import useRideRequests from '../../../../../hooks/rides/useRideRequests';
/**
 * HostPanel component displays a list of available ride requests for hosts.
 */
const HostPanel = ({ selectedRide, setSelectedRide, isHandlingRide }) => {
  const { rideRequests, loading, error } = useRideRequests(null); // Ensure this hook is correctly implemented

  if (loading) {
    return <Text>Loading ride requests...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  if (rideRequests.length === 0) {
    return <Text>No available ride requests.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {rideRequests.map((ride) => (
        <Box
          key={ride.id}
          p={4}
          bg={selectedRide?.id === ride.id ? 'blue.100' : 'white'}
          shadow="md"
          rounded="md"
        >
          <Text><strong>Pickup:</strong> {ride.user_location}</Text>
          <Text><strong>Destination:</strong> {ride.destination_location}</Text>
          <Text><strong>Fee:</strong> ${ride.rideFee ? ride.rideFee.toFixed(2) : 'N/A'}</Text>
          <Button
            colorScheme="blue"
            mt={2}
            onClick={() => setSelectedRide(ride)}
            isDisabled={isHandlingRide && selectedRide?.id !== ride.id}
          >
            {selectedRide?.id === ride.id ? 'Selected' : 'Select Ride'}
          </Button>
        </Box>
      ))}
    </VStack>
  );
};

HostPanel.propTypes = {
  selectedRide: PropTypes.object,
  setSelectedRide: PropTypes.func.isRequired,
  isHandlingRide: PropTypes.bool.isRequired,
};

export default HostPanel;
