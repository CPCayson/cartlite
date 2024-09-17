// src/components/RideInfo.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from '@chakra-ui/react';

/**
 * RideInfo component displays details about the selected ride.
 */
const RideInfo = ({
  selectedRide,
  onCancelRide,
}) => {
  if (!selectedRide) {
    return null; // Do not render if no ride is selected
  }

  return (
    <Box p={4} bg="gray.100" rounded="md" mt={4}>
      <Text fontSize="lg" fontWeight="bold">Ride Details</Text>
      <Text>Pickup Location: {selectedRide.user_location}</Text>
      <Text>Destination: {selectedRide.destination_location}</Text>
      <Text>Ride Fee: ${selectedRide.rideFee}</Text>
      <Text>Status: {selectedRide.status}</Text>

      <Button
        colorScheme="red"
        mt={2}
        onClick={onCancelRide}
      >
        Cancel Ride
      </Button>
    </Box>
  );
};

RideInfo.propTypes = {
  selectedRide: PropTypes.object,
  onCancelRide: PropTypes.func.isRequired,
};

export default RideInfo;
