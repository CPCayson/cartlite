// src/context/AppContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@context/AuthContext';
import ModalContext from '@context/ModalContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Separate view types for dashboard and left panel
  const [dashboardViewType, setDashboardViewType] = useState('list'); // 'list' or 'grid'
  const [panelViewType, setPanelViewType] = useState('list'); // 'list' or 'grid'

  const [activeSort, setActiveSort] = useState('all');
  const [isHost, setIsHost] = useState(false);

  const { user, updateUserRole } = useAuth();
  const { toggleModal } = useContext(ModalContext);

  useEffect(() => {
    setIsHost(user?.role === 'host');
  }, [user]);

  const togglePanelExpansion = () => setIsPanelExpanded((prev) => !prev);
  const toggleRightPanel = () => setIsRightPanelOpen((prev) => !prev);

  // Separate toggle functions
  const toggleDashboardViewType = () => setDashboardViewType((prev) => (prev === 'list' ? 'grid' : 'list'));
  const togglePanelViewType = () => setPanelViewType((prev) => (prev === 'list' ? 'grid' : 'list'));

  const toggleHostMode = async () => {
    if (user && !user.isAnonymous) {
      const newRole = isHost ? 'user' : 'host';
      await updateUserRole(newRole);
      setIsHost(!isHost);
    } else {
      toggleModal('signup');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isPanelExpanded,
        togglePanelExpansion,
        isRightPanelOpen,
        toggleRightPanel,
        dashboardViewType,
        toggleDashboardViewType,
        panelViewType,
        togglePanelViewType,
        activeSort,
        setActiveSort,
        isHost,
        toggleHostMode,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContext;
