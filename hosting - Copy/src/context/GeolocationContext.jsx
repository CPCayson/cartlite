// src/context/GeolocationContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { db } from '../hooks/firebase/firebaseConfig'; // Adjust the path as needed
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import throttle from 'lodash/throttle'; // Install lodash if not already: npm install lodash

// Create the GeolocationContext
export const GeolocationContext = createContext();

/**
 * GeolocationProvider manages user geolocation state and updates it in Firestore or sessionStorage.
 */
export const GeolocationProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [geolocation, setGeolocation] = useState(null); // Local state for geolocation
  const [error, setError] = useState(null); // Error state

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  /**
   * Throttled function to update geolocation.
   * Updates at most once every 5 minutes.
   */
  const throttledUpdateGeolocation = useMemo(
    () =>
      throttle((coords) => {
        setGeolocation((prevCoords) => {
          // Prevent updating if coordinates haven't changed
          if (
            prevCoords &&
            prevCoords.lat === coords.lat &&
            prevCoords.lng === coords.lng
          ) {
            return prevCoords;
          }
          return coords;
        });

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
      }, 300000), // 300,000 ms = 5 minutes
    [user]
  );

  /**
   * Watch the user's location with throttling.
   */
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          throttledUpdateGeolocation(coords);
        },
        (err) => {
          console.error('Error getting user location:', err);
          setError('Unable to retrieve location.');
        },
        { enableHighAccuracy: true, timeout: 50000, maximumAge: 0 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        throttledUpdateGeolocation.cancel(); // Cancel any pending throttled calls
      };
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [throttledUpdateGeolocation]);

  /**
   * Memoize the context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(
    () => ({ geolocation, updateGeolocation: throttledUpdateGeolocation, error }),
    [geolocation, throttledUpdateGeolocation, error]
  );

  return (
    <GeolocationContext.Provider value={contextValue}>
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
// src/hooks/useBusinessesHook.jsx

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useBookingCalculation } from './useBookingCalculation'; // Adjust path as needed
import { useGeolocation } from '../context/GeolocationContext'; // Adjust path as needed
import { BusinessContext } from '../context/BusinessContext'; // Correct import

const useBusinessesHook = (activeCategory = 'all') => {
    const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const  { geolocation}  =useGeolocation();
  const { updateBookingAmount } = useBookingCalculation();

  const {
    businesses,
    loadingBusinesses,
    errorBusinesses,
    fetchBusinesses,
    handleSelectItem,
    hasMore,
    loadMoreBusinesses,
  } = useContext(BusinessContext);

  /**
   * Recalculates prices for businesses based on user geolocation.
   * Only updates the price field to avoid re-rendering the entire list.
   * @param {Array} businessesData - The array of business objects.
   * @returns {Array} - The array of businesses with updated prices.
   */
  const recalculatePrices = useCallback(
    (businessesData) => {
      if (!geolocation) return businessesData;

      return businessesData.map((business) => {
        const price = updateBookingAmount(
          geolocation,
          { lat: business.latitude, lng: business.longitude }
        );

        // Only update the price field
        if (price !== null && price !== business.price) {
          return {
            ...business,
            price,
          };
        }
        return business;
      });
    },
    [updateBookingAmount, geolocation]
  );

  /**
   * Fetches the initial set of businesses based on the active category.
   */
  useEffect(() => {
    const fetchInitialBusinesses = async () => {
      try {
        const { businessesData } = await fetchBusinesses(activeCategory);
        const businessesWithPrices = recalculatePrices(businessesData);
        // The BusinessContext handles caching, so we just set the filtered businesses here
        // No need to set state here since BusinessContext manages the businesses
      } catch (error) {
        console.error('Error fetching initial businesses:', error);
      }
    };

    if (geolocation) {
      fetchInitialBusinesses();
    }
  }, [activeCategory, fetchBusinesses, recalculatePrices, geolocation]);

  /**
   * Handles loading more businesses for pagination.
   */
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingBusinesses) {
      loadMoreBusinesses(activeCategory);
    }
  }, [hasMore, loadingBusinesses, loadMoreBusinesses, activeCategory]);

  /**
   * Memoize filtered and sorted businesses to optimize performance.
   */
  const filteredBusinessesMemo = useMemo(() => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter((business) =>
        typeof business.name === 'string' &&
        business.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (business) =>
          typeof business.category === 'string' &&
          business.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return filtered;
  }, [businesses, searchTerm, activeCategory, sortBy]);

  return {
    filteredBusinesses: filteredBusinessesMemo,
    loading: loadingBusinesses,
    error: errorBusinesses,
    hasMore,
    loadMoreBusinesses: handleLoadMore,
    setSearchTerm,
    setSortBy,
    sortBy,
    searchTerm,
    handleSelectItem,
    businesses
  };
};

export default useBusinessesHook;
