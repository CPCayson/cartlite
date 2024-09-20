import { useState, useEffect, useCallback, useRef, useContext, useMemo } from 'react';
import { useBookingCalculation } from '@hooks/useBookingCalculation'; // Adjust path as needed
import { useAuth } from '@context/AuthContext'; // Adjust path as needed
import { GeolocationContext } from '@context/GeolocationContext'; // Adjust path as needed
import { BusinessContext } from '@context/BusinessContext'; // Correctly importing the BusinessContext

const PAGE_SIZE = 10;

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

  // Correct reference to fetchBusinesses from BusinessContext
  const {
    businesses,
    loadingBusinesses,
    errorBusinesses,
    fetchBusinesses, // Correctly referencing fetchBusinesses from context
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
          const { businessesData, lastVisible } = await fetchBusinesses(activeCategory); // Fetching businesses
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
   * Handles loading more businesses for pagination.
   */
  const loadMoreBusinesses = useCallback(async () => {
    if (!hasMore || loadingBusinesses) return; // Prevent loading more if already loading or no more items

    try {
      const { businessesData, lastVisible } = await fetchBusinesses(activeCategory, lastVisibleDoc); // Fetch more businesses
      const businessesWithPrices = recalculatePrices(businessesData);

      // Prevent adding duplicates
      setFilteredBusinesses((prev) => {
        const existingIds = new Set(prev.map(b => b.id));
        const newBusinesses = businessesWithPrices.filter(b => !existingIds.has(b.id));
        return [...prev, ...newBusinesses];
      });

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

  return {
    filteredBusinesses: filteredBusinessesMemo,
    loading: loadingBusinesses,
    error: errorBusinesses,
    hasMore,
    loadMoreBusinesses,
    setSearchTerm,
    setSortBy,
    sortBy,
    searchTerm,
  };
};

export default useBusinessesHook;
