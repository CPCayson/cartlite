import { useState, useEffect } from 'react';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';

const useRideTracking = (selectedRide) => {
  const [hostLocation, setHostLocation] = useState(null);
  const firestoreDb = getFirestore();

  useEffect(() => {
    if (selectedRide) {
      const unsubscribe = onSnapshot(doc(firestoreDb, 'rideRequests', selectedRide.id), (doc) => {
        const data = doc.data();
        if (data && data.host_location) {
          setHostLocation(data.host_location);
        }
      });
      return () => unsubscribe();
    }
  }, [selectedRide, firestoreDb]);

  return { hostLocation };
};

export default useRideTracking;
