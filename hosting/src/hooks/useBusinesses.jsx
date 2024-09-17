import { useState, useEffect, useCallback, useContext } from 'react';
import { collection, getDocs, query, limit, startAfter, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import { useBookingCalculation } from './useBookingCalculation';
import { useAuth } from '../context/AuthContext';
import { GeolocationContext } from '../context/GeolocationContext';

const PAGE_SIZE = 10;
const CACHE_KEY = 'userLocation';

const useBusinesses = (activeCategory = 'all') => {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [cachedBusinesses, setCachedBusinesses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);

  const { user } = useAuth();
  const { geolocation } = useContext(GeolocationContext);
  const { updateBookingAmount } = useBookingCalculation();

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
          // You might want to update the GeolocationContext here if needed
        }
      }
    };

    updateLocation();
  }, [geolocation, user, fetchUserLocation]);

  const buildBusinessQuery = useCallback((category, lastDoc = null) => {
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
  }, []);

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

  useEffect(() => {
    const fetchInitialBusinesses = async () => {
      if (cachedBusinesses[activeCategory]) {
        const cachedData = cachedBusinesses[activeCategory].businesses;
        const businessesWithPrices = recalculatePrices(cachedData);
        setBusinesses(businessesWithPrices);
        setFilteredBusinesses(businessesWithPrices);
        setLastVisibleDoc(cachedBusinesses[activeCategory].lastVisible);
        setHasMore(cachedBusinesses[activeCategory].hasMore);
      } else {
        const { businessesData, lastVisible } = await fetchBusinesses(activeCategory);
        const businessesWithPrices = recalculatePrices(businessesData);
        setBusinesses(businessesWithPrices);
        setFilteredBusinesses(businessesWithPrices);
        setLastVisibleDoc(lastVisible);
        setHasMore(businessesData.length === PAGE_SIZE);

        setCachedBusinesses((prevCache) => ({
          ...prevCache,
          [activeCategory]: {
            businesses: businessesWithPrices,
            lastVisible,
            hasMore: businessesData.length === PAGE_SIZE,
          },
        }));
      }
    };

    if (geolocation) {
      fetchInitialBusinesses();
    }
  }, [activeCategory, fetchBusinesses, recalculatePrices, cachedBusinesses, geolocation]);

  useEffect(() => {
    if (businesses.length > 0 && geolocation) {
      const updatedBusinesses = recalculatePrices(businesses);
      setBusinesses(updatedBusinesses);
      setFilteredBusinesses(updatedBusinesses);

      setCachedBusinesses((prevCache) => ({
        ...prevCache,
        [activeCategory]: {
          ...prevCache[activeCategory],
          businesses: updatedBusinesses,
        },
      }));
    }
  }, [geolocation, businesses, recalculatePrices, activeCategory]);

  const loadMoreBusinesses = useCallback(
    async () => {
      if (!hasMore || loading) return;

      const { businessesData, lastVisible } = await fetchBusinesses(activeCategory, lastVisibleDoc);
      const businessesWithPrices = recalculatePrices(businessesData);

      setBusinesses((prevBusinesses) => [...prevBusinesses, ...businessesWithPrices]);
      setFilteredBusinesses((prevFiltered) => [...prevFiltered, ...businessesWithPrices]);
      setLastVisibleDoc(lastVisible);
      setHasMore(businessesData.length === PAGE_SIZE);

      setCachedBusinesses((prevCache) => ({
        ...prevCache,
        [activeCategory]: {
          businesses: [...prevCache[activeCategory].businesses, ...businessesWithPrices],
          lastVisible,
          hasMore: businessesData.length === PAGE_SIZE,
        },
      }));
    },
    [activeCategory, hasMore, loading, fetchBusinesses, lastVisibleDoc, recalculatePrices]
  );

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


