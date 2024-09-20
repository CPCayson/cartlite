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
