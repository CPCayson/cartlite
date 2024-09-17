import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as necessary
import PropTypes from 'prop-types';
import { Button, Box, VStack, HStack, Text, useColorModeValue, Spinner } from '@chakra-ui/react';
import { ChevronRight, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';

const RideRequestDetails = ({ rideRequest }) => {
  console.log('RideRequestDetails: Rendering with rideRequest:', rideRequest);
  if (!rideRequest) return <Text>No ride request data available.</Text>;

  return (
    <VStack align="start" spacing={2}>
      <Text fontWeight="bold">Ride Request Details:</Text>
      <Text>Status: {rideRequest.status ?? 'N/A'}</Text>
      <Text>Ride Fee: ${rideRequest.rideFee?.toFixed(2) ?? 'N/A'}</Text>
      <Text>From: {rideRequest.user_location ?? 'N/A'}</Text>
      <Text>To: {rideRequest.destination_location ?? 'N/A'}</Text>
      <Text>Created At: {rideRequest.createdAt?.toDate().toLocaleString() ?? 'N/A'}</Text>
      <Text>User Email: {rideRequest.user_email ?? 'N/A'}</Text>
      <Text>User ID: {rideRequest.user_uid ?? 'N/A'}</Text>
    </VStack>
  );
};

const RightPanel = ({
  isOpen,
  setIsOpen,
  appMode,
  darkMode,
  rideRequestId,
  rideRequest,
  loading,
  error,
  fetchMostRecentRideRequest,
}) => {
  console.log('RightPanel: Component rendering start');

  const { user } = useAuth(); // Access the session
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    console.log('Component mounted, calling fetchMostRecentRideRequest');
    fetchMostRecentRideRequest();
  }, [fetchMostRecentRideRequest]);

  useEffect(() => {
    if (user) {
      console.log('RightPanel: User is logged in:', user.email);
    } else {
      console.log('RightPanel: No user is logged in');
    }
  }, [user]);

  console.log('RightPanel: Current state', {
    isOpen,
    appMode,
    darkMode,
    rideRequestId,
    rideRequest,
    loading,
    error,
  });

  const bgColor = useColorModeValue(darkMode ? 'gray.800' : 'white', 'gray.800');
  const borderColor = useColorModeValue(darkMode ? 'gray.600' : 'gray.200', 'gray.600');
  const textColor = darkMode ? 'white' : 'black';

  const toggleFullScreen = () => {
    console.log('RightPanel: Toggling fullscreen');
    setIsFullScreen(!isFullScreen);
  };

  const panelWidth = isOpen ? (isFullScreen ? '100%' : '50%') : '0';

  return (
    <Box
      width={panelWidth}
      height="100%"
      transition="all 0.3s ease-in-out"
      overflow="hidden"
      backgroundColor={bgColor}
      borderLeft={isOpen ? `1px solid ${borderColor}` : 'none'}
      position={isFullScreen ? 'fixed' : 'relative'}
      top={isFullScreen ? 0 : 'auto'}
      right={isFullScreen ? 0 : 'auto'}
      zIndex={isFullScreen ? 1000 : 'auto'}
      color={textColor}
    >
      {isOpen && (
        <VStack spacing={4} align="stretch" p={4}>
          <HStack justifyContent="space-between">
            <Button
              leftIcon={isOpen ? <ChevronRight /> : <ChevronLeft />}
              onClick={() => setIsOpen(!isOpen)}
              size="sm"
            >
              {isOpen ? 'Close' : 'Open'}
            </Button>
            <Button
              leftIcon={isFullScreen ? <Minimize2 /> : <Maximize2 />}
              onClick={toggleFullScreen}
              size="sm"
            >
              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </HStack>

          {user ? (
            appMode === 'host' ? (
              <VStack spacing={4} align="stretch">
                <Text fontSize="xl" fontWeight="bold">Host Controls</Text>
                <Button colorScheme="blue">Accept Ride</Button>
                <Button colorScheme="green">Start Ride</Button>
                <Button colorScheme="red">End Ride</Button>
              </VStack>
            ) : (
              <>
                {loading ? (
                  <Spinner />
                ) : localError || error ? (
                  <Text color="red.500">{localError || error}</Text>
                ) : rideRequest ? (
                  <RideRequestDetails rideRequest={rideRequest} />
                ) : (
                  <Text>No active ride request found.</Text>
                )}
              </>
            )
          ) : (
            <VStack align="start" spacing={2}>
              <Text>You are browsing as a guest.</Text>
              <Text>Please sign in to access more features.</Text>
            </VStack>
          )}

          <VStack align="start" spacing={2} mt={4}>
            <Text fontWeight="bold">Debug Information:</Text>
            <Text>Ride Request ID: {rideRequestId || 'None'}</Text>
            <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
            <Text>Error: {localError || error || 'None'}</Text>
            <Text>App Mode: {appMode}</Text>
            <Text>Dark Mode: {darkMode ? 'On' : 'Off'}</Text>
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

RideRequestDetails.propTypes = {
  rideRequest: PropTypes.shape({
    status: PropTypes.string,
    rideFee: PropTypes.number,
    user_location: PropTypes.string,
    destination_location: PropTypes.string,
    createdAt: PropTypes.object,
    user_email: PropTypes.string,
    user_uid: PropTypes.string,
  }),
};

RightPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
  rideRequestId: PropTypes.string,
  rideRequest: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  fetchMostRecentRideRequest: PropTypes.func.isRequired,
};

export default RightPanel;
