import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../hooks/firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { useAuth } from '../../context/AuthContext';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const createRideRequestAsync = async () => {
      const query = new URLSearchParams(location.search);
      const sessionId = query.get('session_id');

      if (sessionId) {
        try {
          // Fetch the session from your backend
          const response = await fetch(`/api/retrieve-checkout-session?sessionId=${sessionId}`);
          const session = await response.json();

          // Create ride request
          await createRideRequest({
            amount: session.amount_total / 100,
            userLocation: localStorage.getItem('pickupLocation') || "Pickup Address Example",
            destinationLocation: localStorage.getItem('destinationLocation') || "Destination Address Example"
          }, session.customer_email);
          
          // Clear localStorage
          localStorage.removeItem('bookingAmount');
          localStorage.removeItem('pickupLocation');
          localStorage.removeItem('destinationLocation');
          
          // Navigate to home page
          navigate('/');
        } catch (error) {
          console.error('Error handling success page:', error);
        }
      }
    };

    createRideRequestAsync();
  }, [location.search, navigate]);

  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Processing your ride request...</p>
    </div>
  );
};

const createRideRequest = async (rideDetails, customerEmail) => {
  const rideRequestRef = doc(collection(db, 'rideRequests'));

  try {
    await setDoc(rideRequestRef, {
      id: rideRequestRef.id,
      hostId: '',
      rideFee: rideDetails.amount,
      user_uid: auth.currentUser?.uid || 'anonymous',
      user_email: auth.currentUser?.email || customerEmail,
      user_location: rideDetails.userLocation,
      destination_location: rideDetails.destinationLocation,
      status: 'pending',
      is_driver_assigned: false,
      createdAt: serverTimestamp(),
    });
    console.log('Ride request created successfully with ID:', rideRequestRef.id);
  } catch (error) {
    console.error('Error creating ride request', error);
    throw error;
  }
};

export default CheckoutSuccess;
