import PropTypes from 'prop-types';
import { Menu, Users, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen, setIsRightPanelOpen }) => {
  const { user } = useAuth(); // Use the Auth context to check authentication status

  const handleModeSwitch = () => {
    if (appMode === 'rabbit') {
      if (!user) {
        // If user is not authenticated, open the right panel for login or signup
        setIsRightPanelOpen(true);
        return;
      }
      // If authenticated, switch to host (driver) mode
      setAppMode('host');
    } else {
      // Switch back to rabbit mode
      setAppMode('rabbit');
      setIsRightPanelOpen(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white py-6 px-8 flex justify-between items-center">
      {/* Left side: Menu button and Title */}
      <div className="flex items-center">
        <button onClick={() => setIsLeftPanelOpen(prev => !prev)} className="mr-4">
          <Menu />
        </button>
        <h1 className="text-2xl font-bold">cartRABBIT</h1>
      </div>

      {/* Right side: Navigation and Buttons */}
      <nav className="flex items-center">
        <button 
          onClick={handleModeSwitch} 
          className="px-3 py-2 text-sm mr-4 flex items-center bg-blue-700 dark:bg-blue-600 rounded"
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
