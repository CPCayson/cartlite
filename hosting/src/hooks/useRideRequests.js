// src/hooks/useRideRequests.js

import { useState, useEffect } from 'react';
import firebase from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const useRideRequests = (userId) => {
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.log('useRideRequests: No userId provided, skipping Firestore query');
      return;
    }

    console.log('useRideRequests: Setting up Firestore listener for ride requests');

    const rideRequestsQuery = query(
      collection(firebase.db, 'rideRequests'),
      where('user_uid', '==', userId)
    );

    const unsubscribe = onSnapshot(rideRequestsQuery, (snapshot) => {
      const rides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('useRideRequests: Retrieved ride requests:', rides);
      setRideRequests(rides);
      setLoading(false);
    });

    return () => {
      console.log('useRideRequests: Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [userId]);

  return { rideRequests, loading };
};

export default useRideRequests;
