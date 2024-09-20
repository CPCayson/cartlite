// src/hooks/useUI.jsx

import { useContext } from 'react';
import { UIContext } from '../context/UIContext';

/**
 * Custom hook to consume UIContext.
 */
const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default useUI;
