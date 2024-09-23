import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useBookingCalculation } from './useBookingCalculation'; // Adjust path as needed
import { useGeolocation } from '../context/GeolocationContext'; // Adjust path as needed
import { BusinessContext } from '../context/BusinessContext'; // Correct import

const useBusinessesHook = (activeCategory = 'all') => {
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [cachedBusinesses, setCachedBusinesses] = useState([]);

  const { geolocation } = useGeolocation();
  const { updateBookingAmount } = useBookingCalculation();

  const {
    businesses,
    loadingBusinesses,
    errorBusinesses,
    fetchBusinesses,
    handleSelectItem,
    hasMore,
    loadMoreBusinesses, // Ensure this function is correctly defined in BusinessContext
  } = useContext(BusinessContext);

  const recalculatePrices = useCallback(
    (businessesData) => {
      if (!geolocation) return businessesData;

      return businessesData.map((business) => {
        const price = updateBookingAmount(
          geolocation,
          { lat: business.latitude, lng: business.longitude }
        );

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

  useEffect(() => {
    const fetchInitialBusinesses = async () => {
      try {
        const { businessesData } = await fetchBusinesses(activeCategory);
        setCachedBusinesses(Array.isArray(businessesData) ? businessesData : []);
      } catch (error) {
        console.error('Error fetching initial businesses:', error);
      }
    };

    fetchInitialBusinesses();
  }, [activeCategory, fetchBusinesses]);

  useEffect(() => {
    if (geolocation && cachedBusinesses.length > 0) {
      const businessesWithPrices = recalculatePrices(cachedBusinesses);
      setCachedBusinesses(businessesWithPrices);
    }
  }, [geolocation, recalculatePrices, cachedBusinesses]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingBusinesses) {
      loadMoreBusinesses(activeCategory);
    }
  }, [hasMore, loadingBusinesses, loadMoreBusinesses, activeCategory]);

  const filteredBusinessesMemo = useMemo(() => {
    let filtered = Array.isArray(cachedBusinesses) ? cachedBusinesses : []; // Ensure filtered is always an array

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
  }, [cachedBusinesses, searchTerm, activeCategory, sortBy]);

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
    businesses: cachedBusinesses
  };
};

export default useBusinessesHook;
