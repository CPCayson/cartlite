import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text, Button } from '@chakra-ui/react';

const AcceptedRideInfo = ({ ride, onCancelRide }) => {
  return (
    <Box p={4} borderWidth={1} borderRadius="md">
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold">Accepted Ride</Text>
        <Text>From: {ride.pickup_location}</Text>
        <Text>To: {ride.dropoff_location}</Text>
        <Text>Price: ${ride.priceTotal}</Text>
        <Button colorScheme="red" onClick={() => onCancelRide(ride.id)}>
          Cancel Ride
        </Button>
      </VStack>
    </Box>
  );
};

AcceptedRideInfo.propTypes = {
  ride: PropTypes.object.isRequired,
  onCancelRide: PropTypes.func.isRequired,
};

export default AcceptedRideInfo;

