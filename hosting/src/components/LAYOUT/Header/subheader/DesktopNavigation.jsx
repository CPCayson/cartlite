// header/DesktopNavigation.js
import PropTypes from 'prop-types';
import { Users, Sun, Moon } from 'lucide-react';

const DesktopNavigation = ({ user, appMode, darkMode, handleModeSwitch, setDarkMode, handleLogin, handleLogout }) => (
  <nav className="hidden lg:flex items-center">
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

    {!user ? (
      <button 
        onClick={handleLogin} 
        className="p-3 bg-green-600 rounded mr-4"
      >
        Login
      </button>
    ) : (
      <button 
        onClick={handleLogout} 
        className="p-3 bg-red-600 rounded mr-4"
      >
        Logout
      </button>
    )}
  </nav>
);

DesktopNavigation.propTypes = {
  user: PropTypes.object,
  appMode: PropTypes.string.isRequired,
  darkMode: PropTypes.bool.isRequired,
  handleModeSwitch: PropTypes.func.isRequired,
  setDarkMode: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default DesktopNavigation;

