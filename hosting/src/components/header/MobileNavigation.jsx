// header/MobileNavigation.js
import PropTypes from 'prop-types';
import { Users, Sun, Moon } from 'lucide-react';

const MobileNavigation = ({ user, appMode, darkMode, isMobileMenuOpen, handleModeSwitch, setDarkMode, handleLogin, handleLogout }) => {
  if (!isMobileMenuOpen) return null;

  return (
    <nav className="flex flex-col items-center w-full mt-4 lg:hidden">
      <button 
        onClick={handleModeSwitch} 
        className={`px-3 py-2 text-sm mb-2 flex items-center w-full justify-center ${appMode === 'rabbit' ? 'bg-blue-700' : 'bg-blue-600'} rounded`}
      >
        <Users className="mr-1" />
        {appMode === 'rabbit' ? 'Switch to host' : 'Switch to rabbit'}
      </button>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="p-3 bg-blue-700 dark:bg-blue-600 rounded mb-2 w-full"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {!user ? (
        <button 
          onClick={handleLogin} 
          className="p-3 bg-green-600 rounded mb-2 w-full"
        >
          Login
        </button>
      ) : (
        <button 
          onClick={handleLogout} 
          className="p-3 bg-red-600 rounded mb-2 w-full"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

MobileNavigation.propTypes = {
  user: PropTypes.object,
  appMode: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isMobileMenuOpen: PropTypes.bool.isRequired,
  handleModeSwitch: PropTypes.func.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default MobileNavigation;