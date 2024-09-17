import { useState } from 'react';

export const useBookingCalculation = () => {
  const [bookingAmount, setBookingAmount] = useState(0);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula implementation
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const normalizeDistance = (distance) => {
    // Implementnormalized value between 1- 5 using distance from 2 miles
    return distance;
  };

  const calculatePrice = (normalizedDistance) => {
    // Implement your price calculation logic here
    const basePrice = 5;
    const pricePerKm = 2;
    return basePrice + (normalizedDistance * pricePerKm);
  };

  const updateBookingAmount = (pickupCoords, destinationCoords) => {
    // pickupCoords.lat and pickupCoords.lng should be accessed as properties, not functions
    const distance = calculateDistance(
      pickupCoords.lat, pickupCoords.lng, // Access lat and lng as properties
      destinationCoords.lat, destinationCoords.lng // Access lat and lng as properties
    );
  
    const normalizedDistance = normalizeDistance(distance);
    const bookingAmount = calculatePrice(normalizedDistance);
    setBookingAmount(bookingAmount);
    return bookingAmount;
  };
  

  return { bookingAmount, updateBookingAmount };
};

