// src/components/LAYOUT/Rightpanel/HostPanel/HostDashboard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react';
import RideRequestList from '../../LEFTPANEL/Host/subhost/RideRequestList';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig';
import { useRide } from '@context/RideContext'; // Custom hook to consume RideContext
import useRideRequests from '@hooks/rides/useRideRequests'; // Ensure correct import path

/**
 * HostDashboard component that handles ride request management for 'host' mode.
 */
const HostDashboard = () => {
  const { 
    user, 
    getCurrentLocation, 
    selectedRide, 
    setSelectedRide, 
    isHandlingRide, 
    setIsHandlingRide, 
    handleConfirmRide, 
    handleRideCompletion, 
    handleCancelRide,
    rideRequestId,
    rideRequest
  } = useRide();

  // Fetch ride requests without any filter or with specific filter if needed
  const { rideRequests, loading, error } = useRideRequests(null); // You can pass 'pending' or other statuses

  const availableRideRequests = rideRequests; // Already filtered by the hook

  /**
   * Accepts a ride request by updating Firestore and setting the selected ride.
   * @param {object} rideRequest - The ride request to accept.
   */
  const handleAcceptRide = async (rideRequest) => {
    try {
      const location = await getCurrentLocation();
      await updateDoc(doc(db, 'rideRequests', rideRequest.id), {
        driver_uid: user.uid,
        is_driver_assigned: true,
        driver_location: location,
        rideStatus: 'accepted',
        acceptedAt: serverTimestamp(),
      });
      setSelectedRide(rideRequest);
      setIsHandlingRide(true);
      console.log('HostDashboard: Ride accepted:', rideRequest.id);
    } catch (error) {
      console.error('Error accepting ride:', error);
      // Optionally, display an error message to the user
    }
  };

  /**
   * Confirms the selected ride.
   */
  const confirmRide = async () => {
    try {
      // Implement confirmation logic, e.g., updating ride status in Firestore
      await handleConfirmRide();
      console.log('HostDashboard: Ride confirmed:', rideRequestId);
    } catch (error) {
      console.error('Error confirming ride:', error);
    }
  };

  /**
   * Completes the ride by updating its status and capturing payment.
   */
  const completeRide = async () => {
    try {
      // Implement completion logic, e.g., updating ride status in Firestore
      await handleRideCompletion();
      console.log('HostDashboard: Ride completed:', rideRequestId);
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  };

  /**
   * Cancels the ride.
   */
  const cancelRide = async () => {
    try {
      await handleCancelRide();
      console.log('HostDashboard: Ride canceled:', rideRequestId);
    } catch (error) {
      console.error('Error canceling ride:', error);
    }
  };

  /**
   * Handles refunding the payment for the ride.
   * Implement this function based on your Stripe integration.
   */
  const handleRefundPayment = async () => {
    // Implement refund logic using your Stripe API
    console.log('HostDashboard: Initiating refund for ride:', rideRequestId);
    // Example:
    // await refundPaymentIntent(selectedRide.paymentIntentId);
  };

  /**
   * Handles capturing the payment for the ride.
   * Implement this function based on your Stripe integration.
   */
  const handleCapturePayment = async () => {
    // Implement capture logic using your Stripe API
    console.log('HostDashboard: Capturing payment for ride:', rideRequestId);
    // Example:
    // await capturePaymentIntent(selectedRide.paymentIntentId);
  };

  if (loading) {
    return <Text>Loading ride requests...</Text>;
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  return (
    <Box>
      {selectedRide ? (
        <VStack spacing={4} align="stretch">
          <Box p={4} bg="gray.100" rounded="md">
            <Text fontSize="lg" fontWeight="bold">Selected Ride</Text>
            <Text><strong>Pickup Location:</strong> {selectedRide.user_location}</Text>
            <Text><strong>Destination:</strong> {selectedRide.destination_location}</Text>
            <Text><strong>Ride Fee:</strong> ${selectedRide.rideFee.toFixed(2)}</Text>
            <Text><strong>Status:</strong> {selectedRide.status}</Text>
          </Box>
          <HStack spacing={4}>
            <Button colorScheme="green" onClick={confirmRide}>
              Confirm Ride
            </Button>
            <Button colorScheme="red" onClick={cancelRide}>
              Cancel Ride
            </Button>
            <Button colorScheme="yellow" onClick={handleRefundPayment}>
              Refund Payment
            </Button>
            <Button colorScheme="blue" onClick={handleCapturePayment}>
              Capture Payment
            </Button>
            <Button colorScheme="purple" onClick={completeRide}>
              Complete Ride
            </Button>
          </HStack>
        </VStack>
      ) : (
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Available Ride Requests</Text>
          <RideRequestList 
            rideRequests={availableRideRequests} 
            onRideAccepted={handleAcceptRide} 
            isDisabled={isHandlingRide} 
          />
        </VStack>
      )}
    </Box>
  );
};
HostDashboard.propTypes = {
  // Removed props related to ride handling; handled via Context
};

export default HostDashboard;
