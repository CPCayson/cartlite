import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Firestore imports
import { auth, db } from '../hooks/firebase/firebaseConfig'; // Firebase config

const RideRequestStatus = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ride requests for the current authenticated user in real-time
  useEffect(() => {
    const fetchRideRequests = async () => {
      const user = auth.currentUser;  // Get the current authenticated user
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const userEmail = user.email;

      try {
        // Query rideRequests collection for documents where user_email matches the authenticated user's email
        const rideRequestsRef = collection(db, 'rideRequests');
        const q = query(rideRequestsRef, where('user_email', '==', userEmail));

        // Real-time listener for updates to the rideRequests collection
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedRequests = [];
          querySnapshot.forEach((doc) => {
            fetchedRequests.push({ id: doc.id, ...doc.data() });
          });
          setRideRequests(fetchedRequests);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching ride requests:', err);
          setError(err.message);
          setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRideRequests();
  }, []);

  if (loading) return <div>Loading ride requests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Ride Requests</h2>
      {rideRequests.length > 0 ? (
        rideRequests.map((request) => (
          <div key={request.id} style={{ marginBottom: '1rem' }}>
            <p><strong>Pickup Location:</strong> {request.user_location}</p>
            <p><strong>Destination Location:</strong> {request.destination_location}</p>
            <p><strong>Ride Fee:</strong> ${request.rideFee}</p>
            <p><strong>Status:</strong> {request.status}</p>
          </div>
        ))
      ) : (
        <div>No ride requests found.</div>
      )}
    </div>
  );
};

export default RideRequestStatus;
