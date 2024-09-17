import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';

const useRideRequests = (userId) => {
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firestoreDb = getFirestore(); // Initialize Firestore once

  useEffect(() => {
    if (!userId) {
      console.log('useRideRequests: No userId provided, skipping Firestore query');
      setLoading(false); // No need to load if userId is not provided
      return;
    }

    console.log('useRideRequests: Setting up Firestore listener for ride requests');
    
    try {
      const rideRequestsQuery = query(
        collection(firestoreDb, 'rideRequests'),
      );

      const unsubscribe = onSnapshot(rideRequestsQuery, (snapshot) => {
        const rides = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('useRideRequests: Retrieved ride requests:', rides);
        setRideRequests(rides);
        setLoading(false);
      }, (snapshotError) => {
        console.error('Error fetching ride requests:', snapshotError);
        setError(snapshotError.message);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => {
        console.log('useRideRequests: Cleaning up Firestore listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('useRideRequests: Error setting up Firestore listener:', err);
      setError('Failed to load ride requests.');
      setLoading(false);
    }
  }, [userId, firestoreDb]);

  return { rideRequests, loading, error };
};

export default useRideRequests;
