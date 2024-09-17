// src/context/GeolocationContext.jsx

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext'; // Assuming you have AuthContext for user auth
import { db } from '../hooks/firebase/firebaseConfig'; // Firebase config and db
import { doc, updateDoc } from 'firebase/firestore';
import { calculateDistanceAndTime, calculateTripCost } from '../utils/distanceUtils';

/**
 * Create the GeolocationContext
 */
export const GeolocationContext = createContext();

export const GeolocationProvider = ({ children }) => {
  const { user } = useAuth(); // Access the authenticated user
  const [geolocation, setGeolocation] = useState(null); // Local state for geolocation
  const [destination, setDestination] = useState(null); // Destination location
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
    <GeolocationContext.Provider value={{ geolocation, updateGeolocation, setDestination, error }}>
      {children}
    </GeolocationContext.Provider>
  );
};

GeolocationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
