import React, { useContext } from 'react';
import { AppContext } from '../context/AppStateContext';

const ModeToggleButton = () => {
  const { isHostMode, toggleMode } = useContext(AppContext);

  return (
    <button onClick={toggleMode}>
      Switch to {isHostMode ? 'Guest' : 'Host'} Mode
    </button>
  );
};

export default ModeToggleButton;
