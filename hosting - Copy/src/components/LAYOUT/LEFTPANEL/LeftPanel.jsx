// src/components/LAYOUT/LEFTPANEL/LeftPanel.jsx

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Spinner, Text } from '@chakra-ui/react';
import useUI from '@hooks/useUI'; // Custom Hook to consume UIContext
import useBusinessHook from '@hooks/useBusinesses'; // Custom Hook to consume BusinessContext

const LeftPanel = () => {
  const {
    isLeftPanelOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    appMode,
    viewMode,
  } = useUI();

  const {
    businesses,
    loadingBusinesses,
    errorBusinesses,
    fetchBusinesses,
    handleSelectItem,
  } = useBusinessHook();

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  if (!isLeftPanelOpen) {
    return null;
  }

  return (
    <Box w="250px" bg="gray.100" p={4} overflowY="auto">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          {appMode === 'rabbit' ? 'Available Rides' : 'Businesses'}
        </Text>
        {loadingBusinesses ? (
          <Spinner />
        ) : errorBusinesses ? (
          <Text color="red.500">{errorBusinesses}</Text>
        ) : (
          businesses.map((business) => (
            <Box
              key={business.id}
              p={2}
              bg="white"
              borderRadius="md"
              boxShadow="sm"
              cursor="pointer"
              onClick={() => handleSelectItem(business)}
            >
              <Text>{business.name}</Text>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

// Remove PropTypes related to props; handled via Context
LeftPanel.propTypes = {
  // No props needed as we're using Context
};

export default LeftPanel;
