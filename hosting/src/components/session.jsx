// src/components/LAYOUT/Dashboard.jsx

import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import RabbitDashboard from './Rabbit/RabbitDashboard';
import HostDashboard from './Host/HostDashboard';
import { useUI } from '@context/UIContext'; // Custom hook to consume UIContext
import { useRide } from '@context/RideContext'; // Custom hook to consume RideContext

const Dashboard = () => {
  const { appMode } = useUI();
  const { 
    isHandlingRide, 
    handleConfirmRide, 
    handleRideCompletion,
    handleCancelRide,
    rideRequestId,
    rideRequest 
  } = useRide();

  return (
    <Box bg="gray.50" h="full" overflowY="auto">
      <VStack spacing={4} align="stretch" p={4}>
        <Box h="80vh" position="relative">
          {/* Additional UI elements like buttons can be added here */}
          <Box h="100%" bg="gray.200">
            {appMode === 'rabbit' ? (
              <RabbitDashboard />
            ) : (
              <HostDashboard
                // Props are no longer needed; handled via Context
              />
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard;



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

