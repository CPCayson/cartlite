import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig'; // Ensure correct path

const useRideRequest = (rideRequestId) => {
  const [rideRequest, setRideRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rideRequestId) return;

    const fetchRideRequest = async () => {
      setLoading(true);
      try {
        const rideRequestRef = doc(db, 'rideRequests', rideRequestId);
        const docSnap = await getDoc(rideRequestRef);
        if (docSnap.exists()) {
          setRideRequest(docSnap.data());
        } else {
          setError('No ride request found');
        }
      } catch (err) {
        setError('Failed to fetch ride request');
      } finally {
        setLoading(false);
      }
    };

    fetchRideRequest();
  }, [rideRequestId]);

  return { rideRequest, loading, error };
};

export default useRideRequest;
