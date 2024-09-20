// src/context/UIContext.jsx

import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

// Create the UI Context
export const UIContext = createContext();

/**
 * UIProvider component that provides UI-related state and functions to its children.
 */
export const UIProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState('Ride'); // Default view mode
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('rabbit'); // Default app mode

  return (
    <UIContext.Provider
      value={{
        viewMode,
        setViewMode,
        isLeftPanelOpen,
        setIsLeftPanelOpen,
        isRightPanelOpen,
        setIsRightPanelOpen,
        darkMode,
        setDarkMode,
        appMode,
        setAppMode,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to consume UIContext.
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
