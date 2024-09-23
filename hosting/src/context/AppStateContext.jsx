import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { collection, setDoc, doc, serverTimestamp, getDocs, query, limit, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@hooks/firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import PropTypes from 'prop-types';

export const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('rabbit');
  const [viewMode, setViewMode] = useState('default');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [errorBusinesses, setErrorBusinesses] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideRequestId, setRideRequestId] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [loadingRide, setLoadingRide] = useState(false);
  const [errorRide, setErrorRide] = useState(null);
  const [isHandlingRide, setIsHandlingRide] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [viewType, setViewType] = useState('list');
  const [activeSort, setActiveSort] = useState('all');

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    setLoadingBusinesses(true);
    try {
      const businessQuery = query(collection(db, 'places'), limit(10));
      const querySnapshot = await getDocs(businessQuery);
      const businessesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBusinesses(businessesData);
      setErrorBusinesses(null);
    } catch (err) {
      setErrorBusinesses('Failed to load businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  // Toggle panel expansion
  const togglePanelExpansion = () => setIsPanelExpanded((prev) => !prev);
  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);
  const toggleViewType = () => setViewType((prev) => (prev === 'list' ? 'grid' : 'list'));

  useEffect(() => {
    setIsLeftPanelOpen(true);
    setIsRightPanelOpen(false);
  }, [appMode]);

  return (
    <AppStateContext.Provider
      value={{
        darkMode,
        setDarkMode,
        appMode,
        setAppMode,
        viewMode,
        setViewMode,
        isRightPanelOpen,
        setIsRightPanelOpen,
        isLeftPanelOpen,
        setIsLeftPanelOpen,
        businesses,
        loadingBusinesses,
        errorBusinesses,
        fetchBusinesses,
        selectedItem,
        setSelectedItem,
        selectedRide,
        setSelectedRide,
        rideRequestId,
        setRideRequestId,
        rideRequest,
        loadingRide,
        errorRide,
        isHandlingRide,
        isPanelExpanded,
        togglePanelExpansion,
        viewType,
        toggleViewType,
        activeSort,
        setActiveSort,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

