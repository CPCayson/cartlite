// src/context/BusinessContext.jsx

import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, limit, where, startAfter } from 'firebase/firestore';
import { db } from '../hooks/firebase/firebaseConfig'; // Adjust the path as needed

export const BusinessContext = createContext();

/**
 * BusinessProvider manages the state of businesses, including fetching, caching, and selection.
 */
export const BusinessProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [errorBusinesses, setErrorBusinesses] = useState(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use a Map to cache businesses by category
  const businessesCacheRef = useRef(new Map());

  // Use a Map to keep track of pagination per category
  const paginationRef = useRef(new Map());

  /**
   * Fetch businesses from Firestore with caching and deduplication.
   * @param {string} category - Category to filter businesses.
   * @returns {Object} - Fetched businesses data and last visible document.
   */
  const fetchBusinesses = useCallback(
    async (category = 'all') => {
      // Check if category is already cached
      if (businessesCacheRef.current.has(category)) {
        // Return cached data
        const cachedData = businessesCacheRef.current.get(category);
        return { businessesData: cachedData.businesses, lastVisible: cachedData.lastVisible };
      }

      setLoadingBusinesses(true);
      setErrorBusinesses(null);

      try {
        let businessQuery;

        if (category === 'all') {
          businessQuery = query(collection(db, 'places'), limit(15));
        } else {
          businessQuery = query(
            collection(db, 'places'),
            where('category', '==', category),
            limit(15)
          );
        }

        const querySnapshot = await getDocs(businessQuery);
        const fetchedBusinesses = querySnapshot.docs.map(doc => ({
          id: doc.id, // Ensure this is unique
          ...doc.data(),
        }));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Deduplicate and cache businesses
        businessesCacheRef.current.set(category, {
          businesses: fetchedBusinesses,
          lastVisible: lastVisible || null,
        });

        setBusinesses(prev => [...prev, ...fetchedBusinesses]);

        setHasMore(fetchedBusinesses.length === 15);
        setErrorBusinesses(null);
        return { businessesData: fetchedBusinesses, lastVisible };
      } catch (error) {
        setErrorBusinesses('Failed to load businesses');
        console.error('Error fetching businesses:', error);
        return { businessesData: [], lastVisible: null };
      } finally {
        setLoadingBusinesses(false);
      }
    },
    []
  );

  /**
   * Handles selection of a business item.
   * @param {Object} item - The selected business item.
   */
  const handleSelectItem = useCallback(
    (item) => {
      setSelectedItem(item);
      setIsRightPanelOpen(!!item); // Open the right panel if an item is selected
    },
    []
  );

  /**
   * Load more businesses for pagination.
   * @param {string} category - Current active category.
   */
  const loadMoreBusinesses = useCallback(
    async (category = 'all') => {
      if (!hasMore || loadingBusinesses) return;

      const cachedData = businessesCacheRef.current.get(category);
      if (!cachedData || !cachedData.lastVisible) {
        setHasMore(false);
        return;
      }

      setLoadingBusinesses(true);
      setErrorBusinesses(null);

      try {
        let businessQuery = query(
          collection(db, 'places'),
          where('category', '==', category),
          startAfter(cachedData.lastVisible),
          limit(15)
        );

        const querySnapshot = await getDocs(businessQuery);
        const fetchedBusinesses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Update cache
        businessesCacheRef.current.set(category, {
          businesses: [...cachedData.businesses, ...fetchedBusinesses],
          lastVisible: lastVisible || null,
        });

        setBusinesses(prev => [...prev, ...fetchedBusinesses]);
        setHasMore(fetchedBusinesses.length === 15);
      } catch (error) {
        setErrorBusinesses('Failed to load more businesses');
        console.error('Error loading more businesses:', error);
      } finally {
        setLoadingBusinesses(false);
      }
    },
    [hasMore, loadingBusinesses]
  );

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
        hasMore,
        loadMoreBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

BusinessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BusinessProvider;
