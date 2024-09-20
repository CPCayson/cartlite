// src/hooks/useRideRequests.jsx

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig';

/**
 * Custom hook to fetch ride requests based on a filter.
 * @param {string|null} filter - Criteria to filter ride requests (e.g., 'pending').
 */
const useRideRequests = (filter) => {
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRideRequests = useCallback(async () => {
    setLoading(true);
    try {
      let rideQuery;
      if (filter) {
        rideQuery = query(collection(db, 'rideRequests'), where('status', '==', filter));
      } else {
        rideQuery = query(collection(db, 'rideRequests'));
      }
      const querySnapshot = await getDocs(rideQuery);
      const rides = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRideRequests(rides);
      setError(null);
    } catch (err) {
      console.error('useRideRequests: Error fetching ride requests:', err);
      setError('Failed to load ride requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRideRequests();
  }, [fetchRideRequests]);

  return { rideRequests, loading, error };
};

export default useRideRequests;
