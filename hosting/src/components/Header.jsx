// src/components/Header.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, Users, Sun, Moon, LogOut, LogIn } from 'lucide-react';
import OnboardingModal from './OnboardingModal'; // Import the modal component

const Header = ({ darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen, setIsRightPanelOpen }) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  const handleModeSwitch = () => {
    if (appMode === 'rabbit') {
      setAppMode('host'); // Switch to host mode
      setIsRightPanelOpen(true);
      setIsLeftPanelOpen(false); // Close left panel for host mode
    } else {
      setAppMode('rabbit'); // Switch back to rabbit mode
      setIsLeftPanelOpen(true); // Open left panel for rabbit view
      setIsRightPanelOpen(false); // Ensure right panel is closed
    }
  };

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <OnboardingModal 
          isOpen={showOnboardingModal} 
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      <header className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white py-6 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => setIsLeftPanelOpen(prev => !prev)} className="mr-4">
            <Menu />
          </button>
          <h1 className="text-2xl font-bold">cartRABBIT</h1>
        </div>

        <nav className="flex items-center">
          <button 
            onClick={handleModeSwitch} 
            className={`px-3 py-2 text-sm mr-4 flex items-center ${appMode === 'rabbit' ? 'bg-blue-700' : 'bg-blue-600'} rounded`}
          >
            <Users className="mr-1" />
            {appMode === 'rabbit' ? 'Switch to host' : 'Switch to rabbit'}
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-3 bg-blue-700 dark:bg-blue-600 rounded mr-4"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </nav>
      </header>
    </>
  );
};

Header.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  setAppMode: PropTypes.func.isRequired,
  setIsLeftPanelOpen: PropTypes.func.isRequired,
  setIsRightPanelOpen: PropTypes.func.isRequired,
};

export default Header;
