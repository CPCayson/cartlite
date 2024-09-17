// src/components/dashboard/HostDashboard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from '@chakra-ui/react';
import RideRequestList from './subhost/RideRequestList'; // Assuming you have a component to list ride requests

/**
 * HostDashboard component that handles ride request management for 'host' mode.
 */
const HostDashboard = ({
  selectedRide,
  selectedItem,
  onCancelRide,
  rideRequestId,
}) => {
  return (
    <Box>
      {/* Example HostRideList Component */}
      <RideRequestList />

      {/* Optionally, display selected ride details if any */}
      {selectedRide && (
        <Box p={4} bg="gray.100" rounded="md" mt={4}>
          <Text fontSize="lg" fontWeight="bold">Selected Ride</Text>
          <Text>Pickup Location: {selectedRide.user_location}</Text>
          <Text>Destination: {selectedRide.destination_location}</Text>
          <Text>Ride Fee: ${selectedRide.rideFee}</Text>
          <Text>Status: {selectedRide.status}</Text>
        </Box>
      )}
    </Box>
  );
};

HostDashboard.propTypes = {
  selectedRide: PropTypes.object,
  selectedItem: PropTypes.object,
  onCancelRide: PropTypes.func.isRequired,
  rideRequestId: PropTypes.string,
};

export default HostDashboard;
