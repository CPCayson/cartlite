import { useState, useEffect } from 'react';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';

const useHostLocation = (selectedRide) => {
  const [hostLocation, setHostLocation] = useState(null);
  const firestoreDb = getFirestore();

  useEffect(() => {
    if (selectedRide) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          updateHostLocation(location);
        },
        (error) => console.error('Error getting host location:', error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [selectedRide]);

  const updateHostLocation = (location) => {
    setHostLocation(location);
    if (selectedRide) {
      const rideDocRef = doc(firestoreDb, 'rideRequests', selectedRide.id);
      updateDoc(rideDocRef, {
        host_location: location,
      }).catch((error) => console.error('Error updating host location:', error));
    }
  };

  return { hostLocation, updateHostLocation };
};

export default useHostLocation;
