import { useState, useEffect } from 'react';
import { calculateDistanceAndTime, calculateTripCost } from '../../utils/costCalculationUtil';

export const useLocationTracking = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(currentLocation);
      }, (error) => {
        console.error("Error getting user location:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleLocationUpdate = (location) => setUserLocation(location);

  const handleDestinationSelected = (place) => {
    const end = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
    const start = { lat: userLocation.lat, lng: userLocation.lng };
    const { distance } = calculateDistanceAndTime(start, end);
    setDestination(place.geometry.location);
    return calculateTripCost(distance);
  };

  return { 
    userLocation, 
    destination, 
    setDestination, 
    handleLocationUpdate, 
    handleDestinationSelected 
  };
};
