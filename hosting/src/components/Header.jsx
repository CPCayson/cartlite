import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Menu, Users, Sun, Moon } from 'lucide-react';
import OnboardingModal from './OnboardingModal';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Header = ({ darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen, setIsRightPanelOpen }) => {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || user.email);
      } else {
        setIsAuthenticated(false);
        setUserName('');
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const handleModeSwitch = () => {
    if (appMode === 'rabbit') {
      setAppMode('host'); 
      setIsRightPanelOpen(true);
      setIsLeftPanelOpen(false); 
    } else {
      setAppMode('rabbit'); 
      setIsLeftPanelOpen(true); 
      setIsRightPanelOpen(false); 
    }
  };

  const handleLogin = () => {
    navigate('/signup'); // Redirect to SignupForm route
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully.');
        setIsAuthenticated(false);
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
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

      <header className={`text-white py-4 px-6 flex flex-col items-center 
        ${isAuthenticated ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600' : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600'}`}>
        
        {/* Welcome Banner */}
        {isAuthenticated && (
          <div className="w-full text-center py-2 bg-yellow-300 text-gray-800 rounded mb-2">
            Welcome, {userName}!
          </div>
        )}

        <div className="flex justify-between items-center w-full">
          {/* Logo and Menu Button */}
          <div className="flex items-center">
            {/* Hamburger Menu for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="mr-4 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold">cartRABBIT</h1>
          </div>

          {/* Desktop Navigation */}
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

            {/* Login/Logout Button */}
            {!isAuthenticated ? (
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
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

            {/* Mobile Login/Logout Button */}
            {!isAuthenticated ? (
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
        )}
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
