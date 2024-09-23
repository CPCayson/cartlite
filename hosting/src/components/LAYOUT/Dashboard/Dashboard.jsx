// src/components/LAYOUT/Dashboard.jsx

import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import RabbitDashboard from './Rabbit/RabbitDashboard';
import HostDashboard from './Host/HostDashboard';
import { useUI } from '@context/UIContext'; // Custom hook to consume UIContext
import { useRide } from '@context/RideContext'; // Custom hook to consume RideContext

const Dashboard = () => {
  const { appMode } = useUI();// src/components/dashboard/RabbitDashboard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@chakra-ui/react';
import SearchBar from './SearchBar';
import RideInfo from '../../../SESSION/RideInfo';
import RideStatusTracker from '../../../SESSION/RideStatusTracker';
import MapComponent from './Map/MapComponent';

/**
 * RabbitDashboard component that handles ride functionalities for 'rabbit' mode.
 */
const RabbitDashboard = ({
  selectedRide,
  selectedItem,
  onCancelRide,
  onSearchDestinationSelect,
  onSearchPickupSelect,
  rideRequestId,
  isRideInfoVisible, // New prop
}) => {
  /**
   * Handles booking a ride by integrating with SearchBar.
   * @param {object} rideData - Data containing destination, pickupLocation, and bookingAmount.
   */
  const handleBookRide = (rideData) => {
    console.log('RabbitDashboard: Booking ride with data:', rideData);
    // Implement booking logic here, such as creating a Stripe session or updating Firestore
    // Example:
    // createStripeSession(rideData).then((paymentIntent) => {
    //   handleRideRequestCreation(paymentIntent, rideData, user.email);
    // });
  };

  return (
    <Box position="relative" minHeight="100vh">
      {/* Sticky SearchBar Container */}
      <Box
        position="sticky"
        top="0"
        zIndex="1000" // Ensure it stays above other components
        backgroundColor="white" // Optional: Set a background to avoid transparency
        padding="4" // Optional: Add padding as needed
        boxShadow="sm" // Optional: Add shadow for better visibility
      >
        <SearchBar
          onDestinationSelect={onSearchDestinationSelect}
          onPickupSelect={onSearchPickupSelect}
          onBookRide={handleBookRide}
          initialLatLng={selectedItem ? { lat: selectedItem.latitude, lng: selectedItem.longitude } : null}
          selectedItem={selectedItem}
          selectedRide={selectedRide}
        />
      </Box>

      {/* Main Content Container */}
      <Box padding="4">
        {/* Horizontally Split Container */}
        <Flex
          direction={{ base: 'column', md: 'row' }} // Stack vertically on small screens
          gap="4" // Space between columns
        >
          {/* Conditionally Render RideInfo */}
          {isRideInfoVisible && (
            <Box
              flex={{ base: 'none', md: '1' }} // Full width on small screens, flex on medium and above
              maxW={{ base: '100%', md: '30%' }} // Adjust the max width as needed
            >
              <RideInfo selectedRide={selectedRide} onCancelRide={onCancelRide} />
            </Box>
          )}

          {/* MapComponent */}
          <Box
            flex={isRideInfoVisible ? { base: 'none', md: '2' } : { base: 'none', md: '1' }} // Adjust flex based on visibility
            height={{ base: '300px', md: '600px' }} // Set height for the map
            minHeight="300px" // Ensure a minimum height
          >
            <MapComponent
              businesses={selectedItem ? [selectedItem] : []} // Assuming selectedItem is a single business
              selectedPlace={
                selectedRide
                  ? {
                      latitude: selectedRide.user_location.lat,
                      longitude: selectedRide.user_location.lng,
                      name: 'Pickup Location',
                    }
                  : null
              }
              onSearchDestinationSelect={onSearchDestinationSelect}
              onSearchPickupSelect={onSearchPickupSelect}
            />
          </Box>
        </Flex>

        {/* RideStatusTracker Component */}
        {rideRequestId && (
          <Box marginTop="4">
            <RideStatusTracker rideRequestId={rideRequestId} />
          </Box>
        )}

        {/* Add more components as needed */}
      </Box>
    </Box>
  );
};

RabbitDashboard.propTypes = {
  selectedRide: PropTypes.object,
  selectedItem: PropTypes.object,
  onCancelRide: PropTypes.func.isRequired,
  onSearchDestinationSelect: PropTypes.func.isRequired,
  onSearchPickupSelect: PropTypes.func.isRequired,
  rideRequestId: PropTypes.string, // rideRequestId is optional; conditionally rendered
  isRideInfoVisible: PropTypes.bool.isRequired, // New prop
};

export default RabbitDashboard;
// src/components/MapComponent.jsx

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
