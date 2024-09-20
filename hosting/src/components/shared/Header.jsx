// src/components/shared/Header.jsx

import React, { useContext } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import ThemeContext from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import ModalContext from '@context/ModalContext';
import AppContext from '@context/AppContext';

const Header = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const { toggleModal } = useContext(ModalContext);
  const { toggleRightPanel } = useContext(AppContext); // Added for toggling RightPanel

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header flex justify-between items-center p-4 bg-teal-600 dark:bg-teal-700">
      <h1 className="header-title text-xl sm:text-2xl font-bold text-white">cartRABBIT</h1>

      <div className="header-actions flex items-center space-x-2 sm:space-x-4">
        {user && user.isAnonymous ? (
          <button
            onClick={() => toggleModal('signup')}
            className="header-button btn"
            aria-label="Upgrade Account"
          >
            Upgrade Account
          </button>
        ) : user ? (
          <>
            <span className="header-welcome text-sm sm:text-base text-white">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="header-button btn"
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => toggleModal('signup')}
            className="header-button btn"
            aria-label="Log In"
          >
            Log In
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className="header-button btn"
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          onClick={toggleRightPanel}
          className="header-button btn"
          aria-label="Toggle Right Panel"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
