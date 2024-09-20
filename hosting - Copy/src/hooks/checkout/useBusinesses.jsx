// src/hooks/useBusinesses.jsx

import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  collection,
  getDocs,
  query,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useBookingCalculation } from '../useBookingCalculation';
import { useAuth } from '@context/AuthContext';
import { GeolocationContext } from '@context/GeolocationContext';
import { useUI } from '@context/UIContext';

const PAGE_SIZE = 10;
const CACHE_KEY = 'userLocation';

/**
 * Custom hook to fetch and manage businesses with pagination, filtering, and caching.
 * @param {string} activeCategory - The currently active category filter.
 */
const useBusinesses = (activeCategory = 'all') => {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const cachedBusinessesRef = useRef({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);

  const { user } = useAuth();
  const { geolocation } = useContext(GeolocationContext);
  const { updateBookingAmount } = useBookingCalculation();
  const { viewType } = useUI();

  /**
   * Fetches the user's location from Firestore or sessionStorage.
   */
  const fetchUserLocation = useCallback(async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().geolocation) {
        return userDoc.data().geolocation;
      }
    } else {
      const cachedLocation = sessionStorage.getItem(CACHE_KEY);
      if (cachedLocation) {
        return JSON.parse(cachedLocation);
      }
    }
    return null;
  }, [user]);

  /**
   * Updates the user's location in Firestore or sessionStorage.
   */
  useEffect(() => {
    const updateLocation = async () => {
      if (geolocation) {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { geolocation });
        } else {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(geolocation));
        }
      } else {
        const savedLocation = await fetchUserLocation();
        if (savedLocation) {
          // If geolocation is not available, use the saved location
          // Optionally, update the GeolocationContext here if needed
        }
      }
    };

    updateLocation();
  }, [geolocation, user, fetchUserLocation]);

  /**
   * Builds a Firestore query based on category and pagination.
   * @param {string} category - The category to filter by.
   * @param {object|null} lastDoc - The last document fetched for pagination.
   * @returns {Query} - The Firestore query.
   */
  const buildBusinessQuery = useCallback(
    (category, lastDoc = null) => {
      let baseQuery = query(collection(db, 'places'), limit(PAGE_SIZE));

      if (category !== 'all') {
        baseQuery = query(
          collection(db, 'places'),
          where('category', '==', category),
          limit(PAGE_SIZE)
        );
      }

      if (lastDoc) {
        baseQuery = query(baseQuery, startAfter(lastDoc));
      }

      return baseQuery;
    },
    []
  );

  /**
   * Fetches businesses from Firestore based on category and pagination.
   * @param {string} category - The category to filter by.
   * @param {object|null} lastDoc - The last document fetched for pagination.
   * @returns {object} - An object containing fetched businesses and the last visible document.
   */
  const fetchBusinesses = useCallback(
    async (category, lastDoc = null) => {
      setLoading(true);
      setError(null);

      try {
        const businessQuery = buildBusinessQuery(category, lastDoc);
        const querySnapshot = await getDocs(businessQuery);

        const businessesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { businessesData, lastVisible };
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setError('Failed to load businesses');
        return { businessesData: [], lastVisible: null };
      } finally {
        setLoading(false);
      }
    },
    [buildBusinessQuery]
  );

  /**
   * Recalculates prices for businesses based on user geolocation.
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

        return {
          ...business,
          price: price !== null ? price : undefined,
        };
      });
    },
    [updateBookingAmount, geolocation]
  );

  /**
   * Fetches the initial set of businesses based on the active category.
   */
  useEffect(() => {
    const fetchInitialBusinesses = async () => {
      if (cachedBusinessesRef.current[activeCategory]) {
        const cachedData = cachedBusinessesRef.current[activeCategory].businesses;
        const businessesWithPrices = recalculatePrices(cachedData);
        setBusinesses(businessesWithPrices);
        setFilteredBusinesses(businessesWithPrices);
        setLastVisibleDoc(cachedBusinessesRef.current[activeCategory].lastVisible);
        setHasMore(cachedBusinessesRef.current[activeCategory].hasMore);
      } else {
        const { businessesData, lastVisible } = await fetchBusinesses(activeCategory);
        const businessesWithPrices = recalculatePrices(businessesData);
        setBusinesses(businessesWithPrices);
        setFilteredBusinesses(businessesWithPrices);
        setLastVisibleDoc(lastVisible);
        setHasMore(businessesData.length === PAGE_SIZE);

        cachedBusinessesRef.current[activeCategory] = {
          businesses: businessesWithPrices,
          lastVisible,
          hasMore: businessesData.length === PAGE_SIZE,
        };
      }
    };

    if (geolocation) {
      fetchInitialBusinesses();
    }
  }, [activeCategory, fetchBusinesses, recalculatePrices, geolocation]);

  /**
   * Updates businesses when geolocation changes.
   */
  useEffect(() => {
    if (businesses.length > 0 && geolocation) {
      const updatedBusinesses = recalculatePrices(businesses);
      setBusinesses(updatedBusinesses);
      setFilteredBusinesses(updatedBusinesses);

      if (cachedBusinessesRef.current[activeCategory]) {
        cachedBusinessesRef.current[activeCategory].businesses = updatedBusinesses;
      }
    }
  }, [geolocation, businesses, recalculatePrices, activeCategory]);

  /**
   * Loads more businesses for pagination.
   */
  const loadMoreBusinesses = useCallback(async () => {
    if (!hasMore || loading) return;

    const { businessesData, lastVisible } = await fetchBusinesses(activeCategory, lastVisibleDoc);
    const businessesWithPrices = recalculatePrices(businessesData);

    setBusinesses((prevBusinesses) => [...prevBusinesses, ...businessesWithPrices]);
    setFilteredBusinesses((prevFiltered) => [...prevFiltered, ...businessesWithPrices]);
    setLastVisibleDoc(lastVisible);
    setHasMore(businessesData.length === PAGE_SIZE);

    if (cachedBusinessesRef.current[activeCategory]) {
      cachedBusinessesRef.current[activeCategory].businesses.push(...businessesWithPrices);
      cachedBusinessesRef.current[activeCategory].lastVisible = lastVisible;
      cachedBusinessesRef.current[activeCategory].hasMore = businessesData.length === PAGE_SIZE;
    } else {
      cachedBusinessesRef.current[activeCategory] = {
        businesses: businessesWithPrices,
        lastVisible,
        hasMore: businessesData.length === PAGE_SIZE,
      };
    }
  }, [activeCategory, hasMore, loading, fetchBusinesses, lastVisibleDoc, recalculatePrices]);

  return {
    businesses,
    filteredBusinesses,
    loading,
    error,
    hasMore,
    loadMoreBusinesses,
    userLocation: geolocation,
  };
};

export default useBusinesses;
