// src/hooks/useBusinessesHook.jsx

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useBookingCalculation } from './useBookingCalculation'; // Adjust path as needed
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { GeolocationContext } from '../context/GeolocationContext'; // Adjust path as needed
import { BusinessContext } from '../context/BusinessContext'; // Correctly importing the BusinessContext

const useBusinessesHook = (activeCategory = 'all') => {
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
  };
};

export default useBusinessesHook;
