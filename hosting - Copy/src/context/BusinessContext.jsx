// src/context/BusinessContext.jsx

import React, { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig'; // Adjust path as needed

// Create the Business Context
export const BusinessContext = createContext();

/**
 * BusinessProvider component that provides business-related state to its children.
 */
export const BusinessProvider = ({ children }) => {
  // Business States
  const [businesses, setBusinesses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [errorBusinesses, setErrorBusinesses] = useState(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  /**
   * Fetches a list of businesses from Firestore, limited to PAGE_SIZE.
   * @param {string} category - The category to filter by.
   * @returns {object} - An object containing fetched businesses and the last visible document.
   */
  const fetchBusinesses = useCallback(async (category = 'all') => {
    console.log('BusinessContext: Attempting to fetch businesses...');
    setLoadingBusinesses(true);
    try {
      let businessQuery;
      if (category !== 'all') {
        businessQuery = query(
          collection(db, 'places'),
          where('category', '==', category),
          limit(10) // Adjust PAGE_SIZE as needed
        );
      } else {
        businessQuery = query(collection(db, 'places'), limit(10));
      }
      const querySnapshot = await getDocs(businessQuery);
      const businessesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('BusinessContext: Successfully fetched businesses', businessesData);
      setBusinesses(businessesData); // Update businesses state
      setErrorBusinesses(null);
      return { businessesData, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
    } catch (err) {
      console.error('BusinessContext: Error fetching businesses:', err);
      setErrorBusinesses('Failed to load businesses');
      return { businessesData: [], lastVisible: null };
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  /**
   * Handles the selection of a business item.
   * @param {object|null} item - The selected business item or null to deselect.
   */
  const handleSelectItem = useCallback((item) => {
    console.log('BusinessContext: Item selected', item);
    setSelectedItem(item);
    setIsRightPanelOpen(!!item); // Open panel if item is selected, else close
  }, []);

  // Return the state and functions
  return (
    <BusinessContext.Provider
      value={{
        businesses,
        selectedItem,
        loadingBusinesses,
        errorBusinesses,
        fetchBusinesses,
        handleSelectItem,
        isRightPanelOpen,
        setIsRightPanelOpen,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

BusinessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
import { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';

import { useBookingCalculation } from '@hooks/useBookingCalculation'; // Adjust path as needed
import { useAuth } from '@context/AuthContext'; // Adjust path as needed
import { GeolocationContext } from '@context/GeolocationContext'; // Adjust path as needed
import { BusinessContext } from '@context/BusinessContext'; // Adjust path as needed

const PAGE_SIZE = 10;
const CACHE_KEY = 'userLocation';

/**
 * Custom hook to fetch and manage businesses with pagination, filtering, and caching.
 * @param {string} activeCategory - The currently active category filter.
 */
const useBusinessesHook = (activeCategory = 'all') => {
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const cachedBusinessesRef = useRef({});
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { geolocation } = useContext(GeolocationContext);
  const { updateBookingAmount } = useBookingCalculation();
  const {
    businesses,
    loadingBusinesses,
    errorBusinesses,
    fetchBusinesses,
    handleSelectItem,
  } = useContext(BusinessContext);

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
        setFilteredBusinesses(businessesWithPrices);
        setLastVisibleDoc(cachedBusinessesRef.current[activeCategory].lastVisible);
        setHasMore(cachedBusinessesRef.current[activeCategory].hasMore);
      } else {
        try {
          const { businessesData, lastVisible } = await fetchBusinesses(activeCategory);
          const businessesWithPrices = recalculatePrices(businessesData);
          setFilteredBusinesses(businessesWithPrices);
          setLastVisibleDoc(lastVisible);
          setHasMore(businessesData.length === PAGE_SIZE);

          cachedBusinessesRef.current[activeCategory] = {
            businesses: businessesWithPrices,
            lastVisible,
            hasMore: businessesData.length === PAGE_SIZE,
          };
        } catch (error) {
          console.error('Error fetching businesses:', error);
        }
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
      setFilteredBusinesses(updatedBusinesses);

      if (cachedBusinessesRef.current[activeCategory]) {
        cachedBusinessesRef.current[activeCategory].businesses = updatedBusinesses;
      }
    }
  }, [geolocation, businesses, recalculatePrices, activeCategory]);

  /**
   * Handles loading more businesses for pagination.
   */
  const loadMoreBusinesses = useCallback(async () => {
    if (!hasMore || loadingBusinesses) return;  // Prevent loading more if already loading or no more items
  
    try {
      const { businessesData, lastVisible } = await fetchBusinesses(activeCategory, lastVisibleDoc);
      const businessesWithPrices = recalculatePrices(businessesData);
  
      setFilteredBusinesses((prev) => [...prev, ...businessesWithPrices]);
      setLastVisibleDoc(lastVisible);
      setHasMore(businessesData.length === PAGE_SIZE);
  
      cachedBusinessesRef.current[activeCategory] = {
        ...cachedBusinessesRef.current[activeCategory],
        businesses: [...(cachedBusinessesRef.current[activeCategory]?.businesses || []), ...businessesWithPrices],
        lastVisible,
        hasMore: businessesData.length === PAGE_SIZE,
      };
    } catch (error) {
      console.error('Error loading more businesses:', error);
    }
  }, [hasMore, loadingBusinesses, fetchBusinesses, lastVisibleDoc, recalculatePrices, activeCategory]);

  /**
   * Filters businesses based on search term and category.
   */
  const filteredBusinessesMemo = useMemo(() => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter(
        (business) =>
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
        return a.price - b.price;
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return filtered;
  }, [businesses, searchTerm, activeCategory, sortBy]);

  /**
   * Handles sorting option changes.
   * @param {string} sortOption - The sorting option selected.
   */
  const handleSortOption = useCallback((sortOption) => {
    setSortBy(sortOption);
  }, []);

  return {
    filteredBusinesses: filteredBusinessesMemo,
    loading: loadingBusinesses,
    error: errorBusinesses,
    hasMore,
    loadMoreBusinesses,
    setSearchTerm,
    setSortBy: handleSortOption,
    sortBy,
    searchTerm,
  };
};

export default useBusinessesHook;
