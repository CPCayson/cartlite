// src/components/LAYOUT/ViewToggle/ViewToggle.jsx

import React from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import  useUI  from '@hooks/useUI'; // Consume UIContext

const ViewToggle = () => {
  const { setViewMode, setIsLeftPanelOpen, setIsRightPanelOpen } = useUI();

  const handleLeftPanelView = () => {
    setViewMode('Explore');
    setIsLeftPanelOpen(true);  // Open left panel
    setIsRightPanelOpen(false); // Close right panel
  };

  const handleDashboardView = () => {
    setViewMode('Ride');
    setIsLeftPanelOpen(false);  // Close left panel
    setIsRightPanelOpen(false); // Close right panel
  };

  const handleRightPanelView = () => {
    setViewMode('Delivery');
    setIsLeftPanelOpen(false);  // Close left panel
    setIsRightPanelOpen(true);  // Open right panel
  };

  return (
    <HStack justifyContent="end" spacing={2} p={2}>
      <Button onClick={handleLeftPanelView} leftIcon={<ChevronLeft />} variant="outline">
        Explore
      </Button>
      <Button onClick={handleDashboardView} variant="solid">
        Ride
      </Button>
      <Button onClick={handleRightPanelView} leftIcon={<ChevronRight />} variant="outline">
        Delivery
      </Button>
    </HStack>
  );
};

export default ViewToggle;
