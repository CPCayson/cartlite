// src/context/GeolocationContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { db } from '../hooks/firebase/firebaseConfig'; // Adjust the path as needed
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Create the GeolocationContext
export const GeolocationContext = createContext();

export const GeolocationProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [geolocation, setGeolocation] = useState(null); // Local state for geolocation
  const [error, setError] = useState(null); // Error state

  // Function to update geolocation in the state and store in Firestore or sessionStorage
  const updateGeolocation = useCallback((coords) => {
    setGeolocation(coords); // Update geolocation state
    console.log('Geolocation updated in state:', coords);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, { geolocation: coords })
        .then(() => console.log('Geolocation successfully stored in Firestore:', coords))
        .catch((error) => console.error('Error updating geolocation in Firestore:', error));
    } else {
      try {
        sessionStorage.setItem('geolocation', JSON.stringify(coords));
        console.log('Geolocation successfully stored in sessionStorage:', coords);
      } catch (error) {
        console.error('Error storing geolocation in sessionStorage:', error);
      }
    }
  }, [user]);

  // Function to watch the user's location continuously
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          updateGeolocation(coords);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setError('Unable to retrieve location.');
        },
        { enableHighAccuracy: true, timeout: 50000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [updateGeolocation]);

  return (
    <GeolocationContext.Provider value={{ geolocation, updateGeolocation, error }}>
      {children}
    </GeolocationContext.Provider>
  );
};

GeolocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume GeolocationContext.
 */
export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
