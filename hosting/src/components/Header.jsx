import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from './header/WelcomeBanner';
import DesktopNavigation from './header/DesktopNavigation';
import MobileNavigation from './header/MobileNavigation';
import Logo from './header/Logo';
import { db } from '../hooks/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Header = ({ darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen, setIsRightPanelOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment success
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (user) {
        try {
          const paymentDocRef = doc(db, 'payments', user.uid);
          const paymentDoc = await getDoc(paymentDocRef);

          if (paymentDoc.exists()) {
            setPaymentSuccess(true); // If payment exists in Firebase, mark as successful
          } else {
            setPaymentSuccess(false); // No payment found, revert to default header
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }
    };

    checkPaymentStatus();
  }, [user]);

  const handleModeSwitch = () => {
    if (appMode === 'rabbit') {
      setAppMode('host');
      setIsRightPanelOpen(false);
      setIsLeftPanelOpen(true);
    } else {
      setAppMode('rabbit');
      setIsLeftPanelOpen(true);
      setIsRightPanelOpen(false);
    }
  };

  const handleLogin = () => {
    navigate('/signup');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`text-white py-4 px-6 flex flex-col items-center 
        ${paymentSuccess 
          ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700' 
          : (user 
              ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600' 
              : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600'
            )}`}>
      
      <WelcomeBanner user={user} />

      <div className="flex justify-between items-center w-full">
        <Logo setIsMobileMenuOpen={setIsMobileMenuOpen} isMobileMenuOpen={isMobileMenuOpen} />
        
        <DesktopNavigation 
          user={user}
          appMode={appMode}
          darkMode={darkMode}
          handleModeSwitch={handleModeSwitch}
          setDarkMode={setDarkMode}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
        />
      </div>

      <MobileNavigation 
        user={user}
        appMode={appMode}
        darkMode={darkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        handleModeSwitch={handleModeSwitch}
        setDarkMode={setDarkMode}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
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
