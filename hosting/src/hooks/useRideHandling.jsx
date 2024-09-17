

import { useState } from 'react';

const useRideHandling = () => {
  const [rideInProgress, setRideInProgress] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  const handleAcceptRide = (ride) => {
    console.log("Ride accepted:", ride);
    setSelectedRide(ride);
    setRideInProgress(true);
    setIsLeftPanelOpen(false);
  };

  const handleCancelRide = () => {
    console.log("Ride cancelled");
    setSelectedRide(null);
    setRideInProgress(false);
    setIsLeftPanelOpen(true);
  };

  return { rideInProgress, selectedRide, isLeftPanelOpen, handleAcceptRide, handleCancelRide };
};

export default useRideHandling;
