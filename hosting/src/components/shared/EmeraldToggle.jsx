// src/components/shared/EmeraldToggle.jsx

import React, { useContext } from 'react';
import { Rabbit } from 'lucide-react';
import AppContext from '@context/AppStateContext';

const EmeraldToggle = () => {
  const { isHost, toggleHostMode } = useContext(AppContext);

  return (
    <div className="emerald-toggle-container">
      <button
        className={`emerald-button ${
          isHost ? 'emerald-button-host' : 'emerald-button-guest'
        }`}
        onClick={toggleHostMode}
      >
        <div className="emerald-gradient" />
        <div
          className={`emerald-switch ${
            isHost ? 'emerald-switch-host' : 'emerald-switch-guest'
          }`}
        >
          {isHost ? (
            <Rabbit size={24} className="text-emerald-500" />
          ) : (
            <span className="emerald-text-host">Host</span>
          )}
        </div>
        <div
          className={`emerald-label ${
            isHost ? 'emerald-label-host' : 'emerald-label-guest'
          }`}
        >
          {isHost ? (
            <span className="emerald-text-guest">Guest</span>
          ) : (
            <span className="emerald-text-guest">Host</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default EmeraldToggle;
