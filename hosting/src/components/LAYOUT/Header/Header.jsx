// src/components/LAYOUT/Header/Header.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext'; // Adjust path as needed
import WelcomeBanner from './subheader/WelcomeBanner';
import DesktopNavigation from './subheader/DesktopNavigation';
import { db } from '@hooks/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { AUTH_MESSAGES } from '@hooks/auth/constants';
import { useToast } from '@chakra-ui/react';
import useUI from '@hooks/useUI'; // Custom Hook to consume UIContext

const Header = () => {
  const { user, logout } = useAuth();
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment success
  const navigate = useNavigate();
  const toast = useToast();

  // Consume UI and Ride Contexts
  const { darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen, setIsRightPanelOpen } = useUI();
  //const { rideRequestId, rideRequest, handleCancelRide, handleConfirmRide } = useRide();

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
          console.error('Error checking payment status:', error);
          toast({
            title: 'Error',
            description: 'Unable to verify payment status.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    checkPaymentStatus();
  }, [user, toast]);

  const handleModeSwitch = async () => {
    if (appMode === 'rabbit') {
      // Attempting to switch to 'host' mode
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign up or log in to access Host mode.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        navigate('/signup'); // Redirect to SignupForm
        return;
      }
      setAppMode('host');
      setIsRightPanelOpen(false);
      setIsLeftPanelOpen(true);
      toast({
        title: 'Host Mode Activated',
        description: 'You have switched to Host mode.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Switching back to 'rabbit' mode
      setAppMode('rabbit');
      setIsLeftPanelOpen(true);
      setIsRightPanelOpen(false);
      toast({
        title: 'Rabbit Mode Activated',
        description: 'You have switched to Rabbit mode.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleLogin = () => {
    navigate('/signup'); // Ensure '/signup' route renders SignupForm
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home page after logout
      toast({
        title: AUTH_MESSAGES.LOGOUT_SUCCESS,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Error',
        description: 'Failed to log out. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <header
      className={`text-white py-4 px-6 flex flex-col items-center 
        ${
          paymentSuccess
            ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700'
            : user
            ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
            : 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600'
        }`}
    >
      <WelcomeBanner user={user} />

      <div className="flex justify-between items-center w-full">
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
    </header>
  );
};

// Removed PropTypes related to Context-managed props
Header.propTypes = {
  // darkMode: PropTypes.bool.isRequired,
  // setDarkMode: PropTypes.func.isRequired,
  // appMode: PropTypes.string.isRequired,
  // setAppMode: PropTypes.func.isRequired,
  // setIsLeftPanelOpen: PropTypes.func.isRequired,
  // setIsRightPanelOpen: PropTypes.func.isRequired,
};

export default Header;
