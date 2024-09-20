// src/hooks/useAppState.jsx

import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { 
  collection, 
  setDoc, 
  doc, 
  serverTimestamp, 
  getDocs, 
  query, 
  limit, 
  onSnapshot,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';

// Create the App State Context
export const AppStateContext = createContext();

/**
 * AppStateProvider component that provides global application state to its children.
 */
export const AppStateProvider = ({ children }) => {
  // ------------------------- UI States -------------------------
  const [darkMode, setDarkMode] = useState(false); // Toggle dark mode
  const [appMode, setAppMode] = useState('rabbit'); // 'rabbit' or 'host' mode
  const [viewMode, setViewMode] = useState('default'); // 'default', 'map', 'list', etc.
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false); // Right panel visibility
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true); // Left panel visibility
  
  // ------------------------- Business States -------------------------
  const [businesses, setBusinesses] = useState([]); // List of businesses
  const [selectedItem, setSelectedItem] = useState(null); // Currently selected business
  const [loadingBusinesses, setLoadingBusinesses] = useState(false); // Loading state for businesses
  const [errorBusinesses, setErrorBusinesses] = useState(null); // Error state for businesses

  // ------------------------- Ride States -------------------------
  const [selectedRide, setSelectedRide] = useState(null); // Currently selected ride
  const [rideRequestId, setRideRequestId] = useState(null); // Current ride request ID
  const [rideRequest, setRideRequest] = useState(null); // Current ride request data
  const [loadingRide, setLoadingRide] = useState(false); // Loading state for rides
  const [errorRide, setErrorRide] = useState(null); // Error state for rides
  const [isHandlingRide, setIsHandlingRide] = useState(false); // New state to track ride handling

  // ------------------- Fetch Businesses Function -------------------
  /**
   * Fetches a list of businesses from Firestore, limited to 10.
   */
  const fetchBusinesses = useCallback(async () => {
    console.log('fetchBusinesses: Attempting to fetch businesses...');
    setLoadingBusinesses(true);
    try {
      const businessQuery = query(collection(db, 'places'), limit(10)); // Limit to 10
      const querySnapshot = await getDocs(businessQuery);
      const businessesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('fetchBusinesses: Successfully fetched businesses', businessesData);
      setBusinesses(businessesData); // Update businesses state
      setErrorBusinesses(null);
    } catch (err) {
      console.error('fetchBusinesses: Error fetching businesses:', err);
      setErrorBusinesses('Failed to load businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  // --------------- Fetch Most Recent Ride Request ---------------
  /**
   * Fetches the most recent ride request for the logged-in user.
   */
  const fetchMostRecentRideRequest = useCallback(async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('fetchMostRecentRideRequest: No user logged in.');
      return;
    }

    console.log('fetchMostRecentRideRequest: Attempting to fetch the most recent ride request...');
    setLoadingRide(true);

    try {
      const rideRequestsQuery = query(
        collection(db, 'rideRequests'),
        where('user_uid', '==', user.uid), // Filter by user ID
        orderBy('createdAt', 'desc'), // Order by the most recent
        limit(1) // Limit to one result
      );

      const querySnapshot = await getDocs(rideRequestsQuery);
      
      if (!querySnapshot.empty) {
        const mostRecentRideRequest = querySnapshot.docs[0];
        console.log('fetchMostRecentRideRequest: Most recent ride request found with ID:', mostRecentRideRequest.id);
        setRideRequestId(mostRecentRideRequest.id); // Update ride request ID
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
  }, []);

  // ------------------- Fetch Ride Request -------------------
  /**
   * Sets up a real-time listener for a specific ride request.
   * @param {string} rideRequestId - The ID of the ride request to listen to.
   */
  const fetchRideRequest = useCallback((rideRequestId) => {
    if (!rideRequestId) {
      console.log('fetchRideRequest: No rideRequestId provided.');
      return;
    }

    console.log(`fetchRideRequest: Attempting to fetch ride request with ID: ${rideRequestId}`);

    const rideRequestRef = doc(db, 'rideRequests', rideRequestId);
    const unsubscribe = onSnapshot(rideRequestRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = { id: docSnapshot.id, ...docSnapshot.data() };
        console.log('fetchRideRequest: Ride request data received:', data);
        setRideRequest(data); // Update ride request state
      } else {
        console.log(`fetchRideRequest: No document found for ID: ${rideRequestId}`);
        setRideRequest(null);
      }
    }, (error) => {
      console.error('fetchRideRequest: Error fetching ride request:', error);
      setErrorRide('Failed to fetch ride request');
    });

    return unsubscribe;
  }, []);

  // ------------------- Ride Request Effect -------------------
  /**
   * Listens for changes in rideRequestId and fetches the corresponding ride request.
   */
  useEffect(() => {
    console.log('useEffect: rideRequestId changed:', rideRequestId);
    let unsubscribe;
    if (rideRequestId) {
      unsubscribe = fetchRideRequest(rideRequestId);
    } else {
      console.log('useEffect: No rideRequestId, clearing ride request.');
      setRideRequest(null);
    }
    return () => {
      if (unsubscribe) {
        console.log('useEffect: Unsubscribing from previous listener.');
        unsubscribe();
      }
    };
  }, [rideRequestId, fetchRideRequest]);

  // ------------------- Handle Ride Request Creation -------------------
  /**
   * Creates a new ride request in Firestore.
   * @param {object} paymentIntent - Payment intent details.
   * @param {object} rideDetails - Details of the ride.
   * @param {string} customerEmail - Email of the customer.
   */
  const handleRideRequestCreation = useCallback(async (paymentIntent, rideDetails, customerEmail) => {
    console.log('handleRideRequestCreation: Attempting to create ride request', { paymentIntent, rideDetails, customerEmail });
    const rideRequestRef = doc(collection(db, 'rideRequests')); // Create a new document reference

    try {
      const rideRequestData = {
        paymentIntentId: paymentIntent.id,
        hostId: '',
        rideFee: rideDetails.amount,
        user_uid: rideDetails.user_uid || 'anonymous',
        user_email: customerEmail,
        user_location: rideDetails.userLocation,
        destination_location: rideDetails.destinationLocation,
        status: 'pending',
        is_driver_assigned: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(rideRequestRef, rideRequestData); // Save the ride request in Firestore

      console.log('handleRideRequestCreation: Ride request created successfully with ID:', rideRequestRef.id);
      setRideRequestId(rideRequestRef.id); // Update ride request ID
    } catch (error) {
      console.error('handleRideRequestCreation: Error creating ride request:', error);
      setErrorRide('Failed to create ride request');
    }
  }, []);

  // ------------------- Handle Ride Cancellation -------------------
  /**
   * Cancels the current ride by clearing related states.
   */
  const handleCancelRide = useCallback(() => {
    console.log('handleCancelRide: Cancelling ride.');
    setSelectedRide(null); // Clear selected ride
    setRideRequestId(null); // Clear ride request ID
    setRideRequest(null); // Clear ride request data
    setIsHandlingRide(false); // Reset handling flag
  }, []);

  // ------------------- Handle Confirm Ride -------------------
  /**
   * Confirms the current ride.
   */
  const handleConfirmRide = useCallback(() => {
    console.log('handleConfirmRide: Confirming ride.');
    setIsHandlingRide(true); // Set handling flag
    // Additional confirmation logic can be added here
  }, []);

  // ------------------- Handle Ride Completion -------------------
  /**
   * Marks the ride as completed.
   */
  const handleRideCompletion = useCallback(() => {
    console.log('handleRideCompletion: Completing ride.');
    setIsHandlingRide(false); // Reset handling flag
    setSelectedRide(null); // Clear selected ride
    // Additional completion logic can be added here
  }, []);

  // ------------------- Handle Destination and Pickup Selection -------------------
  /**
   * Handles the selection of a destination.
   * @param {string} destination - The selected destination address.
   */
  const handleSearchDestinationSelect = useCallback((destination) => {
    console.log('handleSearchDestinationSelect: Destination selected:', destination);
    // Implement destination selection logic here
    // For example, you might want to set it in state or trigger other actions
  }, []);

  /**
   * Handles the selection of a pickup location.
   * @param {string} pickup - The selected pickup address.
   */
  const handleSearchPickupSelect = useCallback((pickup) => {
    console.log('handleSearchPickupSelect: Pickup selected:', pickup);
    // Implement pickup selection logic here
    // For example, you might want to set it in state or trigger other actions
  }, []);

  // ------------------- Effect for App Mode Change -------------------
  /**
   * Resets panel states when the app mode changes.
   */
  useEffect(() => {
    console.log('useEffect: App mode changed to:', appMode);
    setIsLeftPanelOpen(true); // Open left panel
    setIsRightPanelOpen(false); // Close right panel
  }, [appMode]);

  // ------------------- Return States and Functions -------------------
  return (
    <AppStateContext.Provider
      value={{
        // UI States
        darkMode,
        setDarkMode,
        appMode,
        setAppMode,
        viewMode,
        setViewMode,
        isRightPanelOpen,
        setIsRightPanelOpen,
        isLeftPanelOpen,
        setIsLeftPanelOpen,

        // Business States and Functions
        businesses,
        loadingBusinesses,
        errorBusinesses,
        fetchBusinesses,

        // Item Selection
        selectedItem,
        handleSelectItem,

        // Ride States and Functions
        selectedRide,
        setSelectedRide,
        rideRequestId,
        setRideRequestId,
        rideRequest,
        loadingRide,
        errorRide,
        handleSearchDestinationSelect,
        handleSearchPickupSelect,
        handleCancelRide,
        handleRideRequestCreation,
        fetchRideRequest,
        fetchMostRecentRideRequest,

        // New States and Functions
        isHandlingRide,
        handleConfirmRide,
        handleRideCompletion,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Custom hook to consume AppStateContext.
 */
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateProvider;
