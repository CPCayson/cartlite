import React, { createContext, useState, useContext } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [isGuestMode, setIsGuestMode] = useState(true);

  const toggleMode = () => setIsGuestMode((prev) => !prev);

  return (
    <ModeContext.Provider value={{ isGuestMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);