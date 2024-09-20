// src/context/RideContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
  collection,
  setDoc,
  addDoc,
  doc,
  serverTimestamp,
  getDoc,
  query,
  onSnapshot,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig'; // Adjust the path as needed
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import PropTypes from 'prop-types';
import { useGeolocation } from '@context/GeolocationContext';
import {capturePayment, refundPayment} from '@api/stripeApi'
// Create the Ride Context
export const RideContext = createContext();

/**
 * RideProvider component that provides ride-related state and functions to its children.
 */
export const RideProvider = ({ children }) => {
  console.log('RideProvider: Initializing');

  // Ride States
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideRequestId, setRideRequestId] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [loadingRide, setLoadingRide] = useState(false);
  const [errorRide, setErrorRide] = useState(null);
  const [isHandlingRide, setIsHandlingRide] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [activeRide, setActiveRide] = useState(null);
  const [appMode, setAppMode] = useState('rabbit'); // 'rabbit' or 'host'
  const [user, setUser] = useState(null); // Store user state
  const [messages, setMessages] = useState([]); // Messages for the chat

  const auth = getAuth();
  const { geolocation } = useGeolocation(); // Get geolocation from context

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('User signed in:', currentUser.uid);
        setUser(currentUser);
      } else {
        console.log('No user signed in. Signing in anonymously.');
        signInAnonymously(auth)
          .then((result) => {
            setUser(result.user);
            console.log('Anonymous sign-in successful:', result.user.uid);
          })
          .catch((error) => {
            console.error('Anonymous sign-in failed:', error);
            setErrorRide('Failed to sign in anonymously');
          });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  /**
   * Fetches the most recent ride request for the logged-in user.
   */
  const fetchMostRecentRideRequest = useCallback(async () => {
    if (!user) {
      console.log('fetchMostRecentRideRequest: No user logged in.');
      return;
    }

    console.log('fetchMostRecentRideRequest: Attempting to fetch the most recent ride request...');
    setLoadingRide(true);

    try {
      const rideRequestsQuery = query(
        collection(db, 'rideRequests'),
        where('user_uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(rideRequestsQuery);

      if (!querySnapshot.empty) {
        const mostRecentRideRequest = querySnapshot.docs[0];
        console.log('fetchMostRecentRideRequest: Most recent ride request found with ID:', mostRecentRideRequest.id);
        setRideRequestId(mostRecentRideRequest.id);
      } else {
        console.log('fetchMostRecentRideRequest: No ride requests found.');
        setRideRequestId(null);
        setRideRequest(null);
      }
      setErrorRide(null);
    } catch (err) {
      console.error('fetchMostRecentRideRequest: Error fetching ride request:', err);
      setErrorRide('Failed to fetch recent ride request');
    } finally {
      setLoadingRide(false);
    }
  }, [user]);

  /**
   * Handles the creation of a new ride request.
   * @param {object} paymentIntent - Payment intent details.
   * @param {object} rideDetails - Details of the ride.
   * @param {string} customerEmail - Email of the customer.
   */
  const handleRideRequestCreation = useCallback(async (paymentIntent, rideDetails, customerEmail) => {
    console.log('handleRideRequestCreation: Attempting to create ride request', { paymentIntent, rideDetails, customerEmail });

    if (!user) {
      console.error('handleRideRequestCreation: User not authenticated.');
      setErrorRide('User not authenticated. Cannot create ride request.');
      return;
    }

    const rideRequestRef = doc(collection(db, 'rideRequests'));

    try {
      const rideRequestData = {
        paymentIntentId: paymentIntent.id,
        user_location: rideDetails.userLocation, // Should include geopoints and address
        destination_location: rideDetails.destinationLocation, // Should include geopoints and address
        user_email: customerEmail,
        user_uid: user.uid,
        rideFee: rideDetails.amount,
        status: 'pending', // Use lowercase 'pending' for consistency
        is_driver_assigned: false,
        hostId: '',
        hostlocation: '',
        host_distance_away: '',
        host_duration_to_pickup: '',
        createdAt: serverTimestamp(),
        // Add any additional fields here
      };

      await setDoc(rideRequestRef, rideRequestData);

      console.log('handleRideRequestCreation: Ride request created successfully with ID:', rideRequestRef.id);
      setRideRequestId(rideRequestRef.id);
      setMessage('Ride request created successfully!');
    } catch (error) {
      console.error('handleRideRequestCreation: Error creating ride request:', error);
      setErrorRide('Failed to create ride request');
    }
  }, [user]);

  /**
   * Cancels the ride.
   */
  const handleCancelRide = useCallback(async () => {
    console.log('handleCancelRide: Cancelling ride.');
    if (activeRide) {
      try {
        const rideRef = doc(db, 'rideRequests', activeRide.id);
        await updateDoc(rideRef, {
          status: appMode === 'rabbit' ? 'cancelled_by_rider' : 'cancelled_by_host',
          is_driver_assigned: false,
          hostId: '',
          hostlocation: '',
          host_distance_away: '',
          host_duration_to_pickup: '',
          cancelledAt: serverTimestamp(),
        });
        setMessage('Ride cancelled successfully!');
        // TODO: Refund or cancel the payment via Stripe API
        // Notify the other party if needed
      } catch (error) {
        console.error('handleCancelRide: Error cancelling ride:', error);
        setErrorRide('Failed to cancel ride. Please try again.');
      }
    }
    setActiveRide(null);
    setRideRequestId(null);
    setRideRequest(null);
    setIsHandlingRide(false);
    setIsLeftPanelOpen(true);
  }, [activeRide, appMode]);

  /**
   * Fetches ride requests based on the current app mode.
   */
  const fetchRideRequests = useCallback(() => {
    console.log('fetchRideRequests: Setting up real-time listener for ride requests.');
    setLoadingRide(true);

    if (!user) {
      console.log('fetchRideRequests: No user logged in.');
      setLoadingRide(false);
      return;
    }

    let rideQuery;
    if (appMode === 'host') {
      rideQuery = query(
        collection(db, 'rideRequests'),
        where('is_driver_assigned', '==', false)
      );
    } else if (appMode === 'rabbit') {
      rideQuery = query(
        collection(db, 'rideRequests'),
        where('user_uid', '==', user.uid)
      );
    } else {
      setLoadingRide(false);
      return;
    }

    const unsubscribe = onSnapshot(rideQuery, (querySnapshot) => {
      const rides = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('fetchRideRequests: Fetched ride requests:', rides);
      setRideRequests(rides);
      setErrorRide(null);
      setLoadingRide(false);
    }, (err) => {
      console.error('fetchRideRequests: Error fetching ride requests:', err);
      setErrorRide('Failed to load ride requests');
      setLoadingRide(false);
    });

    return unsubscribe;
  }, [appMode, user]);

  /**
   * Effect to fetch ride requests when appMode or user changes.
   */
  useEffect(() => {
    const unsubscribe = fetchRideRequests();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchRideRequests]);

  /**
   * Handles accepting a ride (for hosts).
   * @param {object} ride - The ride to be accepted.
   */
  const handleAcceptRide = useCallback(async (ride) => {
    console.log("handleAcceptRide: Ride accepted:", ride);
    if (!user) {
      console.error('handleAcceptRide: No user logged in.');
      setErrorRide('You must be logged in to accept a ride.');
      return;
    }

    try {
      const rideRef = doc(db, 'rideRequests', ride.id);
      const hostLocation = geolocation || await getUserLocation(user.uid);

      await updateDoc(rideRef, {
        status: 'accepted',
        is_driver_assigned: true,
        hostId: user.uid,
        hostlocation: hostLocation,
        acceptedAt: serverTimestamp(),
      });

      // Calculate host distance and duration to pickup
      const distanceData = calculateDistanceAndDuration(hostLocation, ride.user_location);
      await updateDoc(rideRef, {
        host_distance_away: distanceData.distance,
        host_duration_to_pickup: distanceData.duration,
      });

      setActiveRide({ ...ride, hostId: user.uid, hostlocation: hostLocation });
      setSelectedRide(null);
      setMessage('Ride accepted successfully!');
      setIsHandlingRide(true);
      setIsLeftPanelOpen(false);
    } catch (error) {
      console.error('handleAcceptRide: Error accepting ride:', error);
      setErrorRide('Failed to accept ride. Please try again.');
    }
  }, [user, geolocation]);

  /**
   * Host starts the ride.
   */
  const handleStartRide = useCallback(async () => {
    console.log('handleStartRide: Starting ride.');
    if (activeRide) {
      try {
        const rideRef = doc(db, 'rideRequests', activeRide.id);
        await updateDoc(rideRef, {
          status: 'in_progress',
          startedAt: serverTimestamp(),
        });
        setMessage('Ride started.');
        // Notify the rider if needed
      } catch (error) {
        console.error('handleStartRide: Error starting ride:', error);
        setErrorRide('Failed to start ride. Please try again.');
      }
    }
  }, [activeRide]);

  /**
   * Host completes the ride.
   */
  const handleRideCompletion = useCallback(async () => {
    console.log('handleRideCompletion: Completing ride.');
    if (activeRide) {
      try {
        const rideRef = doc(db, 'rideRequests', activeRide.id);
        await updateDoc(rideRef, {
          status: 'completed',
          completedAt: serverTimestamp(),
        });
        setMessage('Ride completed successfully!');
        // TODO: Capture the payment via Stripe API
        // Move the ride request to a bookings collection
        await addDoc(collection(db, 'bookings'), { ...activeRide });
        // Clean up
        setActiveRide(null);
      } catch (error) {
        console.error('handleRideCompletion: Error completing ride:', error);
        setErrorRide('Failed to complete ride. Please try again.');
      }
    }
  }, [activeRide]);

  /**
   * Toggles the app mode between 'rabbit' and 'host'.
   */
  const toggleAppMode = useCallback(() => {
    setAppMode(prevMode => (prevMode === 'rabbit' ? 'host' : 'rabbit'));
    setSelectedRide(null);
    setActiveRide(null);
    setRideRequests([]);
    setRideRequestId(null);
    setRideRequest(null);
    setErrorRide(null);
    setMessage('');
    console.log('toggleAppMode: Switched to', appMode === 'rabbit' ? 'host' : 'rabbit', 'mode.');
  }, [appMode]);

  /**
   * Retrieves the user's current location from the users collection.
   * @param {string} uid - User ID.
   * @returns {object} Geolocation data.
   */
  const getUserLocation = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      return userSnapshot.data().geolocation;
    } else {
      console.error('getUserLocation: No user data found for UID:', uid);
      return null;
    }
  };

  /**
   * Calculates distance and duration between two locations.
   * @param {object} from - Starting location { lat, lng }.
   * @param {object} to - Destination location { lat, lng }.
   * @returns {object} Distance and duration data.
   */
  const calculateDistanceAndDuration = (from, to) => {
    // Implement the Haversine formula or use a geolocation library
    const distance = haversineDistance(from, to); // Distance in miles
    const speed = 25; // Average speed in mph for golf carts
    const duration = (distance / speed) * 60; // Duration in minutes
    return { distance, duration };
  };

  /**
   * Haversine formula to calculate the great-circle distance between two points.
   * @param {object} coords1 - First coordinate { lat, lng }.
   * @param {object} coords2 - Second coordinate { lat, lng }.
   * @returns {number} Distance in miles.
   */
  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 3958.8; // Radius of Earth in miles
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));
    return R * c;
  };

  /**
   * Subscribes to messages for the active ride.
   */
  const subscribeToMessages = useCallback((rideRequestId) => {
    if (!rideRequestId) return;

    const messagesRef = collection(db, 'rideRequests', rideRequestId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    }, (error) => {
      console.error('Error fetching messages:', error);
      setErrorRide('Failed to load messages');
    });

    return unsubscribe;
  }, []);

  /**
   * Sends a message in the active ride's chat.
   * @param {string} messageText - The message content.
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!activeRide || !user) {
      console.error('Cannot send message: No active ride or user.');
      return;
    }

    try {
      const messagesRef = collection(db, 'rideRequests', activeRide.id, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderType: appMode === 'rabbit' ? 'rider' : 'host',
        message: messageText,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorRide('Failed to send message');
    }
  }, [activeRide, user, appMode]);

  /**
   * Subscribes to the active ride for the user.
   */
  const subscribeToActiveRide = useCallback(() => {
    if (!user) return;

    const rideQuery = query(
      collection(db, 'rideRequests'),
      where(appMode === 'rabbit' ? 'user_uid' : 'hostId', '==', user.uid),
      where('status', 'in', ['pending', 'accepted', 'in_progress'])
    );

    const unsubscribe = onSnapshot(rideQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const ride = querySnapshot.docs[0];
        const rideData = { id: ride.id, ...ride.data() };
        setActiveRide(rideData);
        setRideRequestId(ride.id);
      } else {
        setActiveRide(null);
        setRideRequestId(null);
      }
    }, (error) => {
      console.error('subscribeToActiveRide: Error fetching active ride:', error);
      setErrorRide('Failed to fetch active ride');
    });

    return unsubscribe;
  }, [user, appMode]);

  // Subscribe to the active ride for user
  useEffect(() => {
    let unsubscribe;
    unsubscribe = subscribeToActiveRide();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribeToActiveRide]);

  /**
   * Listens to the host's location and updates distance and duration to pickup.
   */
  const listenToHostLocation = useCallback(() => {
    if (!activeRide || !activeRide.hostId || appMode !== 'rabbit') return;

    const hostUserRef = doc(db, 'users', activeRide.hostId);

    const unsubscribe = onSnapshot(hostUserRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const hostData = docSnapshot.data();
        const hostLocation = hostData.geolocation;

        // Calculate distance and duration
        const distanceData = calculateDistanceAndDuration(hostLocation, activeRide.user_location);

        // Update the rideRequest document
        const rideRef = doc(db, 'rideRequests', activeRide.id);
        updateDoc(rideRef, {
          hostlocation: hostLocation,
          host_distance_away: distanceData.distance,
          host_duration_to_pickup: distanceData.duration,
        });
      }
    }, (error) => {
      console.error('listenToHostLocation: Error listening to host location:', error);
    });

    return unsubscribe;
  }, [activeRide, appMode]);

  // Use effect to listen to host location when activeRide changes
  useEffect(() => {
    let unsubscribe;
    if (activeRide && activeRide.hostId && appMode === 'rabbit') {
      unsubscribe = listenToHostLocation();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listenToHostLocation, activeRide, appMode]);

  // Subscribe to messages when activeRide changes
  useEffect(() => {
    let unsubscribe;
    if (activeRide) {
      unsubscribe = subscribeToMessages(activeRide.id);
    } else {
      setMessages([]);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeRide, subscribeToMessages]);

  /**
   * Handles capturing the payment after ride completion.
   */
  const handleCapturePayment = useCallback(async () => {
    if (!activeRide) return;

    try {
      // Call your backend API to capture the payment
      await capturePayment(activeRide.paymentIntentId);

      setMessage('Payment captured successfully!');
    } catch (error) {
      console.error('Error capturing payment:', error);
      setErrorRide('Failed to capture payment.');
    }
  }, [activeRide]);

  /**
   * Handles refunding the payment after cancellation.
   */
  const handleRefundPayment = useCallback(async () => {
    if (!activeRide) return;

    try {
      // Call your backend API to refund the payment
      await refundPayment(activeRide.paymentIntentId);

      setMessage('Payment refunded successfully!');
    } catch (error) {
      console.error('Error refunding payment:', error);
      setErrorRide('Failed to refund payment.');
    }
  }, [activeRide]);

  // Return the state and functions
  return (
    <RideContext.Provider
      value={{
        selectedRide,
        setSelectedRide,
        rideRequestId,
        setRideRequestId,
        rideRequest,
        loadingRide,
        errorRide,
        handleCancelRide,
        handleRideRequestCreation,
        fetchMostRecentRideRequest,
        isHandlingRide,
        handleRideCompletion,
        rideRequests,
        isLeftPanelOpen,
        setIsLeftPanelOpen,
        fetchRideRequests,
        handleAcceptRide,
        activeRide,
        message,
        appMode,
        setAppMode,
        toggleAppMode,
        user, // Expose user state if needed
        messages,
        sendMessage,
        handleStartRide,
        handleCapturePayment,
        handleRefundPayment,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

RideProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume RideContext.
 */
export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
