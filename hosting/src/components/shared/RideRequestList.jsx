// src/components/leftpanel/subhost/RideRequestList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Text, Button } from '@chakra-ui/react';

/**
 * RideRequestList component displays a list of available ride requests.
 */
const RideRequestList = ({ rideRequests, onRideAccepted, isDisabled }) => {
  if (rideRequests.length === 0) {
    return <Text>No available ride requests.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {rideRequests.map((ride) => (
        <Box key={ride.id} p={4} bg="white" shadow="md" rounded="md">
          <Text><strong>Pickup:</strong> {ride.user_location}</Text>
          <Text><strong>Destination:</strong> {ride.destination_location}</Text>
          <Text><strong>Fee:</strong> ${ride.rideFee.toFixed(2)}</Text>
          <Button
            colorScheme="blue"
            mt={2}
            onClick={() => onRideAccepted(ride)}
            isDisabled={isDisabled}
          >
            {isDisabled ? 'Handling Ride' : 'Accept Ride'}
          </Button>
        </Box>
      ))}
    </VStack>
  );
};

RideRequestList.propTypes = {
  rideRequests: PropTypes.array.isRequired,
  onRideAccepted: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

RideRequestList.defaultProps = {
  isDisabled: false,
};

export default RideRequestList;
