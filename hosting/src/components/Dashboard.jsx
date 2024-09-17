// src/components/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { Box, VStack, Button, useColorModeValue, Text, HStack } from '@chakra-ui/react';
import { MapPin, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import RabbitDashboard from './dashboard/RabbitDashboard';
import HostDashboard from './dashboard/HostDashboard';
import useAppState from '../hooks/useAppState';

const Dashboard = ({
  selectedItem,
  handleCancelRide,
  handleSearchDestinationSelect,
  handleSearchPickupSelect,
}) => {
  const { user } = useAuth();
  const [mapView, setMapView] = useState('default');
  const [isRideInfoVisible, setIsRideInfoVisible] = useState(true); // New state
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const {
    selectedRide,
    rideRequestId,
    appMode,
  } = useAppState();

  const handleViewChange = useCallback((view) => {
    setMapView(view);
    // Implement map view logic if necessary
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Dashboard: User is logged in:', user.email);
    } else {
      console.log('Dashboard: No user is logged in');
    }
  }, [user]);

  // Toggle function
  const toggleRideInfo = () => {
    setIsRideInfoVisible((prev) => !prev);
  };

  return (
    <Box bg={bgColor} h="full" overflowY="auto">
      <VStack spacing={4} align="stretch" p={4}>
        <Box h="80vh" position="relative"> {/* Increased height to accommodate toggle */}
          <Box position="absolute" top={2} right={2} zIndex={10}>
            <HStack spacing={2}>
              <Button
                leftIcon={isRideInfoVisible ? <ChevronLeft /> : <ChevronRight />}
                size="sm"
                onClick={toggleRideInfo}
                mr={2}
              >
                {isRideInfoVisible ? 'Hide Ride Info' : 'Show Ride Info'}
              </Button>
              <Button
                leftIcon={<MapPin />}
                size="sm"
                onClick={() => handleViewChange('pickup')}
                mr={2}
              >
                Pickup
              </Button>
              <Button
                leftIcon={<Navigation />}
                size="sm"
                onClick={() => handleViewChange('destination')}
              >
                Destination
              </Button>
            </HStack>
          </Box>
          
          <Box h="100%" bg="gray.200">
            {appMode === 'rabbit' ? (
              <RabbitDashboard
                selectedRide={selectedRide}
                selectedItem={selectedItem}
                onCancelRide={handleCancelRide}
                onSearchDestinationSelect={handleSearchDestinationSelect}
                onSearchPickupSelect={handleSearchPickupSelect}
                rideRequestId={rideRequestId}
                isRideInfoVisible={isRideInfoVisible} // Pass the state
              />
            ) : (
              <HostDashboard
                selectedRide={selectedRide}
                selectedItem={selectedItem}
                onCancelRide={handleCancelRide}
                rideRequestId={rideRequestId}
              />
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

Dashboard.propTypes = {
  selectedItem: PropTypes.object,
  handleCancelRide: PropTypes.func.isRequired,
  handleSearchDestinationSelect: PropTypes.func.isRequired,
  handleSearchPickupSelect: PropTypes.func.isRequired,
};

export default Dashboard;
