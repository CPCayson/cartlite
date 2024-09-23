import React, { createContext, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, limit, where, startAfter, orderBy } from 'firebase/firestore';
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

  // Use a Map to cache businesses by their unique ID
  const businessesCacheRef = useRef(new Map());

  /**
   * Fetch businesses from Firestore with caching and deduplication
   * @param {string} category - Category to filter businesses
   * @param {DocumentSnapshot} lastVisible - Last document snapshot for pagination
   * @returns {Object} - Fetched businesses data and last visible document
   */
  const fetchBusinesses = useCallback(async (category = 'all', lastVisible = null) => {
    setLoadingBusinesses(true);
    try {
      let businessQuery;

      if (category === 'all') {
        businessQuery = query(collection(db, 'places'), orderBy('name'), limit(10));
      } else {
        businessQuery = query(
          collection(db, 'places'),
          where('category', '==', category),
          orderBy('name'),
          limit(10)
        );
      }

      if (lastVisible) {
        businessQuery = query(businessQuery, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(businessQuery);
      const fetchedBusinesses = querySnapshot.docs.map(doc => ({
        id: doc.id, // Ensure this is unique
        ...doc.data(),
      }));

      // Deduplicate and cache businesses
      fetchedBusinesses.forEach(business => {
        if (!businessesCacheRef.current.has(business.id)) {
          businessesCacheRef.current.set(business.id, business);
        }
      });

      const uniqueNewBusinesses = fetchedBusinesses.filter(business => !businesses.includes(business));

      setBusinesses(prev => [...prev, ...uniqueNewBusinesses]);
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      setHasMore(fetchedBusinesses.length === 10); // Assuming PAGE_SIZE is 10

      setErrorBusinesses(null);
      return { businessesData: uniqueNewBusinesses, lastVisible: lastVisibleDoc };
    } catch (error) {
      setErrorBusinesses('Failed to load businesses');
      console.error('Error fetching businesses:', error);
      throw error; // Rethrow to allow hook to catch
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  /**
   * Load more businesses for pagination
   * @param {string} category - Category to filter businesses
   */
  const loadMoreBusinesses = useCallback(async (category = 'all') => {
    const lastVisible = businesses.length > 0 ? businesses[businesses.length - 1].id : null;
    await fetchBusinesses(category, lastVisible);
  }, [businesses, fetchBusinesses]);

  /**
   * Handles selection of a business item
   * @param {Object} item - The selected business item
   */
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsRightPanelOpen(!!item); // Open the right panel if an item is selected
  };

  /**
   * Function to reset businesses cache and state (e.g., when changing category)
   */
  const resetBusinesses = useCallback(() => {
    businessesCacheRef.current.clear();
    setBusinesses([]);
    setHasMore(true);
    setSelectedItem(null);
    setIsRightPanelOpen(false);
  }, []);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        selectedItem,
        loadingBusinesses,
        errorBusinesses,
        fetchBusinesses,
        loadMoreBusinesses, // Add loadMoreBusinesses to the context
        handleSelectItem,
        isRightPanelOpen,
        setIsRightPanelOpen,
        hasMore,
        resetBusinesses,
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
