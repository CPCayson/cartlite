import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text, Button } from '@chakra-ui/react';
import  useAuth  from '../../../context/AuthContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../hooks/firebase/firebaseConfig';

const RideRequestList = ({ rideRequests, onRideAccepted }) => {
  const { user } = useAuth();
  const { lastKnownLocation } = useGeolocation();

  const handleAcceptRide = async (rideRequest) => {
    if (!user || !lastKnownLocation) return;

    try {
      await updateDoc(doc(db, 'rideRequests', rideRequest.id), {
        driver_name: user.displayName,
        driver_location: lastKnownLocation,
        driver_uid: user.uid,
        is_driver_assigned: true,
      });

      onRideAccepted(rideRequest);
    } catch (error) {
      console.error('Error accepting ride:', error);
      // Implement error handling (e.g., show an error message to the user)
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {rideRequests.map((request) => (
        <Box key={request.id} p={4} borderWidth={1} borderRadius="md">
          <Text>From: {request.pickup_location}</Text>
          <Text>To: {request.dropoff_location}</Text>
          <Text>Price: ${request.priceTotal}</Text>
          <Button 
            mt={2} 
            colorScheme="green" 
            onClick={() => handleAcceptRide(request)}
          >
            Accept Ride
          </Button>
        </Box>
      ))}
    </VStack>
  );
};

RideRequestList.propTypes = {
  rideRequests: PropTypes.array.isRequired,
  onRideAccepted: PropTypes.func.isRequired,
};

export default RideRequestList;

